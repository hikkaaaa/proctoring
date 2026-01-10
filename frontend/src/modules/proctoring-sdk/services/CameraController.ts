//turns on the webcam and gives video frames
export class CameraController {
    private videoElement: HTMLVideoElement | null = null;
    private stream: MediaStream | null = null;

    constructor() {}

    // Привязываем HTML элемент <video> к контроллеру
    public attachVideo(element: HTMLVideoElement) {
        this.videoElement = element;
    }

    public async start(): Promise<void> {
        if (!this.videoElement) throw new Error("Video element not attached");

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: false // Пока без звука
            });
            
            this.videoElement.srcObject = this.stream;
            
            // Ждем пока видео реально загрузится
            return new Promise((resolve) => {
                this.videoElement!.onloadedmetadata = () => {
                    this.videoElement!.play();
                    resolve();
                };
            });
        } catch (error) {
            console.error("Camera Error:", error);
            throw error;
        }
    }

    public stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    public getVideo(): HTMLVideoElement | null {
        return this.videoElement;
    }
}