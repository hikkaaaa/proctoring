export interface SystemCheckResults {
    camera: boolean;
    microphone: boolean;
    network: boolean;
    resolution: boolean;
}

export class SystemCheckService {
    static async runFullCheck(): Promise<SystemCheckResults> {
        const results: SystemCheckResults = {
            camera: false,
            microphone: false,
            network: false,
            resolution: false,
        };

        try {
            // 1. Check Camera and Microphone permissions
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (stream) {
                results.camera = stream.getVideoTracks().length > 0;
                results.microphone = stream.getAudioTracks().length > 0;

                // 2. Check Resolution (min 640x480)
                const videoTrack = stream.getVideoTracks()[0];
                const settings = videoTrack.getSettings();
                if (settings.width && settings.height) {
                    results.resolution = settings.width >= 640 && settings.height >= 480;
                }

                // Clean up
                stream.getTracks().forEach(track => track.stop());
            }
        } catch (error) {
            console.error("Hardware Check Error:", error);
        }

        // 3. Check Network (simulated network check)
        results.network = navigator.onLine;

        return results;
    }
}
