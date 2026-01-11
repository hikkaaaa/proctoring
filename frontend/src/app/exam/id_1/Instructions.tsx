'use client';

import React from 'react';
import { TriangleAlert, Video, Play, Smartphone, Ghost, MousePointer, UserMinus, MonitorOff, CircleX } from 'lucide-react';

interface InstructionsProps {
    onStart: () => void;
}

export default function Instructions({ onStart }: InstructionsProps) {

    const handleStartExam = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.warn("Fullscreen request failed:", err);
        }
        onStart();
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full bg-white rounded-[32px] border border-gray-200 shadow-2xl overflow-hidden">

                {/* Header Section */}
                <div className="bg-white px-8 pt-10 pb-6 border-b border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                        <TriangleAlert className="text-orange-600 h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Правила проведения экзамена
                    </h1>
                    <p className="mt-2 text-gray-500 font-medium">Пожалуйста, внимательно ознакомьтесь с правилами ниже.</p>
                </div>

                <div className="p-8 space-y-8">

                    {/* Prohibited Section */}
                    <section>
                        <h2 className="text-xs font-black text-red-600 uppercase tracking-[0.2em] mb-4 flex items-center">
                            <CircleX className="h-4 w-4 mr-2" />
                            Строго запрещено
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            <ProhibitedItem
                                icon={Ghost}
                                text="Нельзя переключать вкладки и сворачивать браузер"
                            />
                            <ProhibitedItem
                                icon={MousePointer}
                                text="Нельзя выходить из полноэкранного режима"
                            />
                            <ProhibitedItem
                                icon={Smartphone}
                                text="Нельзя использовать телефон или дополнительные устройства"
                            />
                            <ProhibitedItem
                                icon={UserMinus}
                                text="Нельзя общаться с другими людьми"
                            />
                            <ProhibitedItem
                                icon={Video}
                                text="Нельзя закрывать лицо или камеру"
                            />
                        </div>
                    </section>

                    {/* Monitoring Section */}
                    <section className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                        <h2 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] mb-4 flex items-center">
                            <Video className="h-4 w-4 mr-2" />
                            Процесс мониторинга
                        </h2>
                        <ul className="space-y-3">
                            <li className="flex items-start text-sm text-orange-900 font-medium leading-relaxed">
                                <div className="h-1.5 w-1.5 bg-orange-400 rounded-full mt-2 mr-3 shrink-0" />
                                Нарушения фиксируются автоматически AI системой в режиме реального времени.
                            </li>
                            <li className="flex items-start text-sm text-orange-900 font-medium leading-relaxed">
                                <div className="h-1.5 w-1.5 bg-orange-400 rounded-full mt-2 mr-3 shrink-0" />
                                Ведется непрерывная видео и аудио запись вашего рабочего места и экрана.
                            </li>
                        </ul>
                    </section>

                    {/* Start Action */}
                    <div className="pt-4">
                        <button
                            onClick={handleStartExam}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center transition-all shadow-xl shadow-orange-200 group active:scale-[0.98]"
                        >
                            <Play className="mr-3 h-6 w-6 fill-current" />
                            Начать тест
                        </button>
                        <p className="mt-4 text-center text-xs text-gray-400 font-medium">
                            При нажатии кнопки браузер перейдет в полноэкранный режим.
                        </p>
                    </div>

                </div>

                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center opacity-60">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UyrenAI Security Protocol</span>
                    <span className="text-[10px] font-mono text-gray-400">ID: EXAM-402-SYS</span>
                </div>

            </div>
        </div>
    );
}

function ProhibitedItem({ icon: Icon, text }: { icon: any, text: string }) {
    if (!Icon) return null;
    return (
        <div className="flex items-center p-4 bg-red-50 rounded-xl border border-red-100 group transition-colors hover:bg-red-100/50">
            <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                <Icon className="text-red-600 h-5 w-5" />
            </div>
            <span className="text-red-900 font-bold text-sm tracking-tight">{text}</span>
        </div>
    );
}
