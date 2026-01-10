//Это React-компонент, который ты увидишь на экране.
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { ProctoringEngine, ProctoringUpdate } from '@/modules/proctoring-sdk/core/ProctoringEngine';

const CameraView = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Состояние теперь хранит только то, что нужно для отрисовки
    const [status, setStatus] = useState("System Offline");
    const [direction, setDirection] = useState<string>("CENTER");

    useEffect(() => {
        // 1. Создаем экземпляр движка
        const engine = new ProctoringEngine();

        const start = async () => {
            if (videoRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                // 2. Подписываемся на обновления от движка
                engine.subscribe((update: ProctoringUpdate) => {
                    setStatus(update.status);
                    setDirection(update.direction);

                    // Отрисовка (View Logic)
                    if (ctx && videoRef.current) {
                        // Синхронизируем размер канваса с видео (на всякий случай)
                        canvas.width = videoRef.current.width;
                        canvas.height = videoRef.current.height;
                        
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        // Рисуем точки, если они есть
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

                // 3. Запускаем
                await engine.start(videoRef.current);
            }
        };

        start();

        // 4. Очистка при уходе со страницы
        return () => {
            engine.stop();
        };
    }, []);

    const borderColor = direction === "CENTER" ? "green" : "red";

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div style={{ 
                position: 'relative', 
                border: `4px solid ${borderColor}`,
                borderRadius: '8px',
                overflow: 'hidden',
                lineHeight: 0
            }}>
                <video 
                    ref={videoRef} 
                    style={{ display: 'block', transform: 'scaleX(-1)' }}
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
                backgroundColor: '#333', color: 'white', borderRadius: '5px' 
            }}>
                Status: {status}
            </div>
        </div>
    );
};

export default CameraView;