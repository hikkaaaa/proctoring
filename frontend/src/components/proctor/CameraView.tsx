"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ProctoringEngine, ProctoringUpdate } from '@/modules/proctoring-sdk/core/ProctoringEngine';

import { useRouter } from 'next/navigation';

const CameraView = () => {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [status, setStatus] = useState("System Offline");
    const [direction, setDirection] = useState<string>("CENTER");
    const [engineInstance, setEngineInstance] = useState<ProctoringEngine | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const engine = new ProctoringEngine();
        setEngineInstance(engine);

        const start = async () => {
            if (videoRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                engine.subscribe((update: ProctoringUpdate) => {
                    setStatus(update.status);
                    setDirection(update.direction);
                    setWarning(update.violationWarning || null);

                    if (ctx && videoRef.current) {
                        canvas.width = videoRef.current.videoWidth || 640;
                        canvas.height = videoRef.current.videoHeight || 480;

                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        if (update.landmarks) {
                            ctx.fillStyle = update.direction === "CENTER" ? "#00FF00" : "#FF0000";
                            for (const point of update.landmarks) {
                                const x = point.x * canvas.width;
                                const y = point.y * canvas.height;
                                ctx.beginPath();
                                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                                ctx.fill();
                            }
                        }
                    }
                });

                await engine.start(videoRef.current);
            }
        };

        start();

        return () => {
            engine.stop();
        };
    }, []);

    const handleFinishExam = async () => {
        if (engineInstance) {
            setIsSaving(true);
            try {
                engineInstance.stop();
                await engineInstance.saveReport();
                setIsSaved(true);
                alert("Exam Finished. Report saved to server!");
                // Redirect to analysis page
                router.push('/exam/id_1/analysis');
            } catch (error) {
                alert("Error saving report. Please try again.");
            } finally {
                setIsSaving(false);
            }
        }
    };

    const borderColor = direction === "CENTER" ? "green" : "red";

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

            {/* Warning Banner */}
            {warning && (
                <div style={{
                    position: 'absolute', top: '10px', backgroundColor: 'red', color: 'white',
                    padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', zIndex: 100,
                    animation: 'pulse 1.5s infinite'
                }}>
                    {warning}
                </div>
            )}

            <div style={{
                position: 'relative',
                border: `4px solid ${borderColor}`,
                borderRadius: '8px',
                overflow: 'hidden',
                lineHeight: 0
            }}>
                <video
                    ref={videoRef}
                    style={{ display: 'block', transform: 'scaleX(-1)', maxWidth: '100%' }}
                    playsInline
                    muted
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%',
                        transform: 'scaleX(-1)'
                    }}
                />

                {direction !== "CENTER" && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(255, 0, 0, 0.8)',
                        color: 'white', padding: '20px',
                        fontSize: '24px', fontWeight: 'bold', borderRadius: '10px'
                    }}>
                        {direction}!
                    </div>
                )}
            </div>

            <div style={{
                marginTop: '10px', padding: '10px',
                backgroundColor: '#333', color: 'white', borderRadius: '5px',
                textAlign: 'center'
            }}>
                Status: {status}
            </div>

            <button
                onClick={handleFinishExam}
                disabled={isSaving || isSaved}
                style={{
                    marginTop: '20px', padding: '12px 24px',
                    backgroundColor: isSaved ? '#10b981' : isSaving ? '#94a3b8' : '#2563eb',
                    color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold',
                    fontSize: '18px', cursor: (isSaving || isSaved) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
            >
                {isSaving ? 'Сохранение...' : isSaved ? 'Отчет сохранен на сервере!' : 'Завершить экзамен и сохранить отчет'}
            </button>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default CameraView;