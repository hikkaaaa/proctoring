import { CameraController } from "@/modules/proctoring-sdk/services/CameraController";
import { FaceMeshService } from "@/modules/vision-ml/vision/faceMesh";
import { GazeEstimator, GazeDirection } from "@/modules/vision-ml/vision/gazeEstimator";
import { Results, NormalizedLandmark } from "@mediapipe/face_mesh";
import { PROCTORING_CONFIG } from "./config";

export interface ProctoringUpdate {
    direction: GazeDirection;
    status: string;
    landmarks?: NormalizedLandmark[];
    violationWarning?: string; // Текст предупреждения (например "Вернитесь!")
}

// Структура одной записи в логе
interface LogEntry {
    timestamp: string;
    elapsedTime: string; // Время от начала экзамена (10:15)
    type: "GAZE_VIOLATION" | "TAB_SWITCH" | "PERSON_MISSING" | "MULTIPLE_FACES" | "SYSTEM";
    message: string;
}

type UpdateListener = (update: ProctoringUpdate) => void;

export class ProctoringEngine {
    private camera: CameraController;
    private ml: FaceMeshService;
    private estimator: GazeEstimator;

    private isRunning: boolean = false;
    private onUpdate: UpdateListener | null = null;
    private animationFrameId: number | null = null;

    // --- State для логики таймеров ---
    private startTime: number = 0; // Когда начался экзамен
    private logs: LogEntry[] = []; // Тут храним всю историю

    // Таймеры нарушений
    private violationStart: number | null = null;
    private currentViolationType: string | null = null;

    constructor() {
        this.camera = new CameraController();
        this.ml = new FaceMeshService();
        this.estimator = new GazeEstimator();
    }

    public subscribe(listener: UpdateListener) {
        this.onUpdate = listener;
    }

    public async start(videoElement: HTMLVideoElement) {
        if (this.isRunning) return;

        this.startTime = Date.now();
        this.logs = []; // Очищаем логи
        this.logEvent("SYSTEM", "Exam Session Started");

        // 1. Подключаем слежку за вкладками
        document.addEventListener("visibilitychange", this.handleTabChange);
        window.addEventListener("blur", this.handleWindowBlur);

        try {
            this.camera.attachVideo(videoElement);
            await this.camera.start();

            // Синхронизация размеров
            videoElement.width = videoElement.videoWidth;
            videoElement.height = videoElement.videoHeight;

            await this.ml.initialize((results) => {
                this.processFrame(results);
            });

            this.isRunning = true;
            this.loop();
        } catch (error) {
            console.error("Start Error", error);
        }
    }

    public stop() {
        this.isRunning = false;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.camera.stop();

        // Удаляем слушателей браузера
        document.removeEventListener("visibilitychange", this.handleTabChange);
        window.removeEventListener("blur", this.handleWindowBlur);

        this.logEvent("SYSTEM", "Exam Session Ended");
    }

    // --- БРАУЗЕРНЫЕ СОБЫТИЯ ---
    private handleTabChange = () => {
        if (document.hidden) {
            this.logEvent("TAB_SWITCH", "User switched tab (Hidden)");
        } else {
            this.logEvent("TAB_SWITCH", "User returned to tab");
        }
    };

    private handleWindowBlur = () => {
        // Blur срабатывает, когда кликнули мимо браузера или открыли другое окно
        this.logEvent("TAB_SWITCH", "Window lost focus (Alt+Tab or Click outside)");
    };

    // --- ГЛАВНАЯ ЛОГИКА КАДРА ---
    private processFrame(results: Results) {
        if (!this.onUpdate) return;
        const now = Date.now();

        // 1. Проверка: ЛИЦ НЕТ
        if (results.multiFaceLandmarks.length === 0) {
            this.handleViolationState(now, "PERSON_MISSING", PROCTORING_CONFIG.MISSING_PERSON_ALLOWANCE_MS);
            this.sendUpdate("CENTER", "User Missing", undefined, "⚠️ ВЕРНИТЕСЬ В КАДР!");
            return;
        }

        // 2. Проверка: МНОГО ЛИЦ
        if (results.multiFaceLandmarks.length > 1) {
            // Тут без таймера, сразу флаг!
            this.logEvent("MULTIPLE_FACES", "Detected more than 1 person!");
            this.sendUpdate("CENTER", "Multiple People", results.multiFaceLandmarks[0], "⚠️ ПОСТОРОННИЙ В КАДРЕ!");
            return;
        }

        // 3. Проверка: ВЗГЛЯД (Нормальное состояние)
        const landmarks = results.multiFaceLandmarks[0];
        const direction = this.estimator.estimate(landmarks);

        if (direction !== "CENTER") {
            // Если смотрит в сторону — запускаем/продолжаем таймер
            this.handleViolationState(now, `LOOKING_${direction}`, PROCTORING_CONFIG.GAZE_ALLOWANCE_MS);
            this.sendUpdate(direction, "Suspicious Activity", landmarks, `⚠️ ВЫ СМОТРИТЕ ${direction}!`);
        } else {
            // Если вернулся в центр — сбрасываем таймер
            this.resetViolationState();
            this.sendUpdate("CENTER", "Active Monitoring", landmarks);
        }
    }

    // --- УПРАВЛЕНИЕ ТАЙМЕРАМИ НАРУШЕНИЙ ---
    private handleViolationState(now: number, type: string, threshold: number) {
        if (this.currentViolationType !== type) {
            // Новое нарушение началось
            this.currentViolationType = type;
            this.violationStart = now;
        } else {
            // Нарушение продолжается. Проверяем длительность
            if (this.violationStart && (now - this.violationStart > threshold)) {
                // ПОРОГ ПРЕВЫШЕН! Логируем.
                if (type === 'PERSON_MISSING') {
                    this.logEvent("PERSON_MISSING", `User absent for > ${threshold / 1000}s`);
                } else {
                    this.logEvent("GAZE_VIOLATION", `Violation confirmed: ${type} for > ${threshold / 1000}s`);
                }

                // Перезапуск таймера (чтобы через 3 сек снова записать, если он всё еще смотрит)
                this.violationStart = now;
            }
        }
    }

    private resetViolationState() {
        this.currentViolationType = null;
        this.violationStart = null;
    }

    // --- ЛОГИРОВАНИЕ ---
    private logEvent(type: LogEntry['type'], message: string) {
        const now = new Date();
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000); // Секунды с начала
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');

        const entry: LogEntry = {
            timestamp: now.toLocaleTimeString(),
            elapsedTime: `${minutes}:${seconds}`,
            type,
            message
        };

        this.logs.push(entry);
        console.warn(`[LOG] ${entry.elapsedTime} - ${type}: ${message}`);
    }

    private sendUpdate(direction: GazeDirection, status: string, landmarks?: NormalizedLandmark[], warning?: string) {
        if (this.onUpdate) {
            this.onUpdate({ direction, status, landmarks, violationWarning: warning });
        }
    }

    // --- ГЕНЕРАЦИЯ ОТЧЕТА ---
    public generateReport(): string {
        // Формируем текстовый файл
        let content = `EXAM INTEGRITY REPORT\n`;
        content += `Student ID: 12345 (Example)\n`;
        content += `Date: ${new Date().toLocaleString()}\n`;
        content += `------------------------------------------------\n`;
        content += `TIME   | TYPE             | DETAILS\n`;
        content += `------------------------------------------------\n`;

        this.logs.forEach(log => {
            content += `[${log.elapsedTime}] | ${log.type.padEnd(16)} | ${log.message}\n`;
        });

        content += `------------------------------------------------\n`;
        content += `Total Events: ${this.logs.length}\n`;

        return content;
    }

    // Метод для отправки отчета на сервер
    public async saveReport() {
        const text = this.generateReport();
        const filename = `report_student_123_${Date.now()}.txt`;

        try {
            const response = await fetch('/api/save-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: text,
                    filename: filename
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save report to server');
            }

            console.log('Report saved successfully');
        } catch (error) {
            console.error('Error in saveReport:', error);
            throw error;
        }
    }

    private loop = async () => {
        if (!this.isRunning) return;
        const video = this.camera.getVideo();
        if (video) await this.ml.send(video);
        this.animationFrameId = requestAnimationFrame(this.loop);
    }
}