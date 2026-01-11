'use client';

import React, { useState } from 'react';
import { Camera, Mic, Monitor, Globe, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';

interface ProctoringGatewayProps {
    onStart: () => void;
}

export default function ProctoringGateway({ onStart }: ProctoringGatewayProps) {
    const [checkedItems, setCheckedItems] = useState({
        video: false,
        personalData: false,
        rules: false,
    });

    const isAllChecked = Object.values(checkedItems).every(Boolean);

    const handleCheckboxChange = (name: keyof typeof checkedItems) => {
        setCheckedItems((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    return (
        <div className="h-screen bg-white flex flex-col md:flex-row font-sans overflow-hidden">
            {/* Left Column: Actions & Legal */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 flex flex-col">
                {/* Brand Header */}
                <div className="flex items-center space-x-2 mb-12">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                        <ShieldAlert className="text-white h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Uyren<span className="text-orange-600">AI</span></span>
                </div>

                <div className="max-w-xl self-center w-full my-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">
                        Начать тест с прокторингом
                    </h1>

                    {/* Warning Box */}
                    <div className="bg-orange-50 border border-orange-100 p-5 mb-8 rounded-2xl flex items-start space-x-4">
                        <div className="bg-orange-100 p-2 rounded-xl">
                            <Camera className="text-orange-600 h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-orange-900 font-bold text-lg mb-1">
                                Видеозапись включена
                            </p>
                            <p className="text-orange-700 text-sm leading-relaxed">
                                Во время всего процесса тестирования будет вестись запись с вашей веб-камеры и экрана.
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                        Объекты мониторинга:
                    </p>

                    {/* Monitored Items List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        {[
                            { icon: Camera, label: 'Камера' },
                            { icon: Mic, label: 'Микрофон' },
                            { icon: Monitor, label: 'Экран' },
                            { icon: Globe, label: 'Браузер' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all duration-200 hover:border-orange-200 hover:bg-white hover:shadow-md group">
                                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:bg-orange-50 transition-colors">
                                    <item.icon className="text-orange-600 h-5 w-5" />
                                </div>
                                <span className="text-gray-700 font-semibold">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-gray-400 text-sm mb-10 flex items-center italic">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-gray-300" />
                        Все данные используются только для верификации теста
                    </p>

                    {/* Interactive Form */}
                    <div className="space-y-4 mb-10">
                        {[
                            { id: 'video', text: 'Я согласен на видеонаблюдение' },
                            { id: 'personalData', text: 'Я согласен на обработку персональных данных' },
                            { id: 'rules', text: 'Я понимаю, что нарушение приведёт к аннулированию результата' }
                        ].map((check) => (
                            <label key={check.id} className="flex items-center space-x-4 cursor-pointer group select-none">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={checkedItems[check.id as keyof typeof checkedItems]}
                                        onChange={() => handleCheckboxChange(check.id as keyof typeof checkedItems)}
                                        className="peer h-6 w-6 appearance-none rounded-lg border-2 border-gray-200 checked:bg-orange-600 checked:border-orange-600 transition-all cursor-pointer shadow-sm group-hover:border-orange-300"
                                    />
                                    <CheckCircle2 className="absolute h-6 w-6 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none p-1" />
                                </div>
                                <span className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors">
                                    {check.text}
                                </span>
                            </label>
                        ))}
                    </div>

                    {/* Main Button */}
                    <button
                        disabled={!isAllChecked}
                        onClick={onStart}
                        className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center transition-all duration-300 shadow-lg ${isAllChecked
                            ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-80 shadow-none'
                            }`}
                    >
                        <Lock className="mr-3 h-6 w-6" />
                        Перейти к проверке системы
                    </button>
                </div>
            </div>

            {/* Right Column: Student Data (Read Only) - Visual Ticket/Summary Card */}
            <div className="w-full md:w-80 lg:w-[400px] bg-gray-50 p-6 md:p-12 flex flex-col items-center justify-center border-l border-gray-200">
                <div className="bg-white p-8 rounded-[40px] border border-gray-200 shadow-2xl shadow-gray-200/50 w-full relative overflow-hidden flex flex-col">
                    {/* Decorative gradients */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 opacity-60" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-50 rounded-tr-full -ml-12 -mb-12" />

                    <div className="mb-8 text-center relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full mx-auto mb-5 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                            <span className="text-2xl font-black text-gray-300 tracking-tighter uppercase">Uyren</span>
                        </div>
                        <span className="inline-flex items-center px-4 py-1.5 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-orange-200 mb-6 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mr-2" />
                            Proctoring required
                        </span>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Иван Иванов</h2>
                        <p className="text-gray-400 font-medium text-sm mt-1">{`ivan@example.com`}</p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-100 border-dashed">
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Student ID</p>
                                <p className="text-gray-900 font-black text-base truncate tabular-nums">ST-123456</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Time Limit</p>
                                <p className="text-gray-900 font-black text-base tabular-nums">60 min</p>
                            </div>
                        </div>

                        <div className="py-2">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Target Examination</p>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-colors">
                                <p className="text-gray-900 font-black text-lg">Python Basics v2</p>
                                <div className="flex items-center mt-1 text-[10px] text-gray-500 font-bold">
                                    <Globe className="h-3 w-3 mr-1" /> ONLINE_PROCTORING_ENV
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2.5">
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Attempt Status</p>
                                <span className="text-orange-600 font-black text-xs uppercase tracking-wider">1 of 3 Used</span>
                            </div>
                            <div className="h-4 w-full bg-gray-100 rounded-xl overflow-hidden p-1 border border-gray-100">
                                <div className="h-full bg-orange-500 w-1/3 rounded-lg shadow-inner shadow-orange-600/20" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-dashed border-gray-200 flex flex-col items-center opacity-50 relative z-10">
                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter">
                            GATEWAY_NODE_ID: 10A-F92
                        </p>
                    </div>
                </div>

                <div className="mt-10 px-8 text-center space-y-4">
                    <p className="text-gray-400 text-[11px] font-bold leading-relaxed tracking-wide uppercase">
                        Platform Security protocol v2.4 <br />
                        <span className="text-gray-300 font-medium lowercase">All sessions recorded and encrypted</span>
                    </p>
                    <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
                        Technical Support
                    </button>
                </div>
            </div>
        </div>
    );
}
