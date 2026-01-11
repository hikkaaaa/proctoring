import { CameraController } from "@/modules/proctoring-sdk/services/CameraController";
import { FaceMeshService } from "@/modules/vision-ml/vision/faceMesh";
import { GazeEstimator, GazeDirection } from "@/modules/vision-ml/vision/gazeEstimator";
import { Results, NormalizedLandmark } from "@mediapipe/face_mesh";

// Тип данных, которые Engine будет отправлять в React каждый кадр
export interface ProctoringUpdate {
    direction: GazeDirection;
    status: string;
    landmarks?: NormalizedLandmark[]; // Точки для рисования
}

type UpdateListener = (update: ProctoringUpdate) => void;

export class ProctoringEngine {
    private camera: CameraController;
    private ml: FaceMeshService;
    private estimator: GazeEstimator;
    private isRunning: boolean = false;
    private animationFrameId: number | null = null;

    // Функция, которую мы будем дергать, чтобы обновить UI
    private onUpdate: UpdateListener | null = null;

    constructor() {
        this.camera = new CameraController();
        this.ml = new FaceMeshService();
        this.estimator = new GazeEstimator();
    }

    // 1. Метод подписки (React дает функцию сюда)
    public subscribe(listener: UpdateListener) {
        this.onUpdate = listener;
    }

    // 2. Главный метод старта
    public async start(videoElement: HTMLVideoElement) {
        if (this.isRunning) return;

        try {
            this.notify("Initializing Camera...");
            this.camera.attachVideo(videoElement);
            await this.camera.start();

            // Синхронизация размеров (важно для точности)
            videoElement.width = videoElement.videoWidth;
            videoElement.height = videoElement.videoHeight;

            this.notify("Loading AI Models...");
            await this.ml.initialize((results) => {
                this.processFrame(results);
            });

            this.isRunning = true;
            this.loop();

        } catch (error) {
            console.error("Engine Start Error:", error);
            this.notify("Error: System failed to start");
        }
    }

    // 3. Обработка каждого кадра (Логика тут!)
    private processFrame(results: Results) {
        if (!this.onUpdate) return;

        if (results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];

            // Спрашиваем у GazeEstimator, куда смотрит лицо
            const direction = this.estimator.estimate(landmarks);

            // Отправляем данные в React
            this.onUpdate({
                direction: direction,
                status: direction === "CENTER" ? "Active Monitoring" : "VIOLATION DETECTED",
                landmarks: landmarks
            });
        } else {
            this.onUpdate({
                direction: "CENTER",
                status: "Face not found",
                landmarks: undefined
            });
        }
    }

    // 4. Бесконечный цикл
    private loop = async () => {
        if (!this.isRunning) return;

        const video = this.camera.getVideo();
        if (video) {
            await this.ml.send(video);
        }

        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    public stop() {
        this.isRunning = false;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.camera.stop();
    }

    // Вспомогательный метод для отправки простых статусов
    private notify(msg: string) {
        if (this.onUpdate) {
            this.onUpdate({
                direction: "CENTER",
                status: msg
            });
        }
    }
}