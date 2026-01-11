//Этот код загружает модель, которая ищет 468 точек на лице.
import { FaceMesh, Results } from "@mediapipe/face_mesh";

export class FaceMeshService {
    private faceMesh: FaceMesh | null = null;

    constructor() { }

    public async initialize(onResults: (results: Results) => void) {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            },
        });

        this.faceMesh.setOptions({
            maxNumFaces: 2,
            refineLandmarks: true, // Более точные глаза и губы
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        this.faceMesh.onResults(onResults);
        await this.faceMesh.initialize();
        console.log("🤖 AI FaceMesh Initialized");
    }

    public async send(videoElement: HTMLVideoElement) {
        if (this.faceMesh) {
            await this.faceMesh.send({ image: videoElement });
        }
    }
}