//сравнивает положение носа с краями лица (скулами). Если нос слишком близко к левой скуле — значит, голова повернута влево.
import { NormalizedLandmark } from "@mediapipe/face_mesh";

export type GazeDirection = "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN";

export class GazeEstimator {
    // Индексы точек лица в MediaPipe (стандартные)
    private readonly LANDMARKS = {
        NOSE_TIP: 1,
        LEFT_CHEEK: 234,  // Левый край лица
        RIGHT_CHEEK: 454, // Правый край лица
        CHIN: 152,
        FOREHEAD: 10
    };

    // Настройки чувствительности (можно менять)
    private readonly THRESHOLDS = {
        HORIZONTAL: 0.25, // Чем меньше число, тем строже проверка
        VERTICAL: 0.15
    };

    public estimate(landmarks: NormalizedLandmark[]): GazeDirection {
        const nose = landmarks[this.LANDMARKS.NOSE_TIP];
        const leftCheek = landmarks[this.LANDMARKS.LEFT_CHEEK];
        const rightCheek = landmarks[this.LANDMARKS.RIGHT_CHEEK];
        const chin = landmarks[this.LANDMARKS.CHIN];
        const forehead = landmarks[this.LANDMARKS.FOREHEAD];

        // 1. Вычисляем ширину лица
        const faceWidth = rightCheek.x - leftCheek.x;
        
        // 2. Вычисляем где находится нос относительно центра (от 0 до 1)
        // 0.5 - это идеально по центру между щеками
        const noseRelativePos = (nose.x - leftCheek.x) / faceWidth;

        // 3. Логика поворота (Зеркальная логика, т.к. камера зеркалит)
        // Если нос ближе к одной из щек
        if (noseRelativePos < 0.5 - this.THRESHOLDS.HORIZONTAL) {
            return "RIGHT"; // Для пользователя это поворот вправо
        }
        if (noseRelativePos > 0.5 + this.THRESHOLDS.HORIZONTAL) {
            return "LEFT"; // Для пользователя это поворот влево
        }

        // 4. Логика наклона (вверх/вниз)
        const faceHeight = chin.y - forehead.y;
        const noseRelativeY = (nose.y - forehead.y) / faceHeight;

        if (noseRelativeY < 0.5 - this.THRESHOLDS.VERTICAL) return "UP";
        if (noseRelativeY > 0.5 + this.THRESHOLDS.VERTICAL) return "DOWN";

        return "CENTER";
    }
}