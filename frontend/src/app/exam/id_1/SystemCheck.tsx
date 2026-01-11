'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, Wifi, Monitor, CheckCircle2, XCircle, ArrowRight, Loader2, RotateCw } from 'lucide-react';
import { SystemCheckService, SystemCheckResults } from '@/modules/proctoring-sdk/services/SystemCheckService';
import { ProctoringEngine, ProctoringUpdate } from '@/modules/proctoring-sdk/core/ProctoringEngine';

interface SystemCheckProps {
    onComplete: () => void;
}

type Phase = 'hardware' | 'calibration';
type CalibrationStep = 'center' | 'left' | 'right' | 'done';

export default function SystemCheck({ onComplete }: SystemCheckProps) {
    const [phase, setPhase] = useState<Phase>('hardware');
    const [hardwareResults, setHardwareResults] = useState<SystemCheckResults | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    // Calibration State
    const [calibrationStep, setCalibrationStep] = useState<CalibrationStep>('center');
    const [currentDirection, setCurrentDirection] = useState<string>('UNKNOWN');
    const [calibrationProgress, setCalibrationProgress] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const engineRef = useRef<ProctoringEngine | null>(null);

    // Hardware Check Logic
    useEffect(() => {
        if (phase === 'hardware') {
            runHardwareCheck();
        }
    }, [phase]);

    const runHardwareCheck = async () => {
        setIsChecking(true);
        const results = await SystemCheckService.runFullCheck();
        setHardwareResults(results);
        setIsChecking(false);
    };

    // Calibration Logic
    useEffect(() => {
        if (phase === 'calibration' && videoRef.current) {
            const engine = new ProctoringEngine();
            engineRef.current = engine;

            engine.subscribe((update: ProctoringUpdate) => {
                setCurrentDirection(update.direction);

                // Auto-advance logic
                if (calibrationStep === 'center' && update.direction === 'CENTER') {
                    setCalibrationProgress(33);
                    setCalibrationStep('left');
                } else if (calibrationStep === 'left' && update.direction === 'LEFT') {
                    setCalibrationProgress(66);
                    setCalibrationStep('right');
                } else if (calibrationStep === 'right' && update.direction === 'RIGHT') {
                    setCalibrationProgress(100);
                    setCalibrationStep('done');
                }
            });

            engine.start(videoRef.current);

            return () => {
                engine.stop();
            };
        }
    }, [phase, calibrationStep]);

    const allHardwarePassed = hardwareResults && Object.values(hardwareResults).every(v => v === true);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
            <div className="max-w-4xl w-full">

                {/* Header */}
                <div className="mb-12 text-center">
                    <h2 className="text-sm font-bold text-orange-500 uppercase tracking-[0.3em] mb-3">System Verification</h2>
                    <h1 className="text-4xl font-black tracking-tight">
                        {phase === 'hardware' ? 'Hardware Diagnostics' : 'AI Face Calibration'}
                    </h1>
                </div>

                {phase === 'hardware' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <CheckItem
                                icon={Camera}
                                label="Camera"
                                status={isChecking ? 'checking' : hardwareResults?.camera ? 'pass' : 'fail'}
                                desc="HD Web Camera Detect"
                            />
                            <CheckItem
                                icon={Mic}
                                label="Microphone"
                                status={isChecking ? 'checking' : hardwareResults?.microphone ? 'pass' : 'fail'}
                                desc="Audio Input Level"
                            />
                            <CheckItem
                                icon={Wifi}
                                label="Network"
                                status={isChecking ? 'checking' : hardwareResults?.network ? 'pass' : 'fail'}
                                desc="Stable Connection"
                            />
                            <CheckItem
                                icon={Monitor}
                                label="Resolution"
                                status={isChecking ? 'checking' : hardwareResults?.resolution ? 'pass' : 'fail'}
                                desc="Screen Size Requirements"
                            />
                        </div>

                        <div className="mt-12 flex flex-col items-center border-t border-slate-800 pt-10">
                            {allHardwarePassed ? (
                                <button
                                    onClick={() => setPhase('calibration')}
                                    className="group bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center transition-all shadow-xl shadow-orange-900/20"
                                >
                                    Continue to Calibration
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div className="text-center">
                                    {!isChecking && (
                                        <p className="text-red-400 font-medium mb-6 flex items-center justify-center">
                                            <XCircle className="h-5 w-5 mr-2" />
                                            Some checks failed. Please grant permissions and retry.
                                        </p>
                                    )}
                                    <button
                                        onClick={runHardwareCheck}
                                        disabled={isChecking}
                                        className="flex items-center text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
                                    >
                                        <RotateCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                                        Run Diagnostics Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'calibration' && (
                    <div className="flex flex-col items-center">
                        <div className="relative w-full max-w-2xl aspect-video rounded-[40px] overflow-hidden border-4 border-slate-800 shadow-2xl bg-black group">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover mirror scale-x-[-1]"
                            />

                            {/* Overlay UI */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                {calibrationStep !== 'done' ? (
                                    <div className="bg-black/40 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10 text-center animate-in fade-in zoom-in duration-500">
                                        <p className="text-orange-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Instructions</p>
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                                            {calibrationStep === 'center' && 'Look at the Center'}
                                            {calibrationStep === 'left' && 'Turn Head Left'}
                                            {calibrationStep === 'right' && 'Turn Head Right'}
                                        </h3>
                                        <div className="mt-4 flex justify-center space-x-2">
                                            <div className={`h-1.5 w-8 rounded-full transition-colors ${calibrationStep === 'center' ? 'bg-orange-500' : 'bg-white/20'}`} />
                                            <div className={`h-1.5 w-8 rounded-full transition-colors ${calibrationStep === 'left' ? 'bg-orange-500' : 'bg-white/20'}`} />
                                            <div className={`h-1.5 w-8 rounded-full transition-colors ${calibrationStep === 'right' ? 'bg-orange-500' : 'bg-white/20'}`} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-orange-600 px-12 py-8 rounded-[40px] text-center shadow-2xl animate-in zoom-in duration-300">
                                        <div className="bg-white/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="text-white h-12 w-12" />
                                        </div>
                                        <h3 className="text-4xl font-black text-white mb-2 tracking-tight">All Systems Go 🚀</h3>
                                        <p className="text-orange-100 font-bold opacity-80 uppercase text-xs tracking-widest">Verification Complete</p>
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-white/10">
                                <div
                                    className="h-full bg-orange-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${calibrationProgress}%` }}
                                />
                            </div>

                            {/* Current Direction Debug */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                                <p className="text-[10px] font-mono text-white/50 uppercase">Input: <span className="text-orange-400 font-bold">{currentDirection}</span></p>
                            </div>
                        </div>

                        {calibrationStep === 'done' && (
                            <button
                                onClick={onComplete}
                                className="mt-10 bg-white text-black hover:bg-orange-50 px-12 py-5 rounded-3xl font-black text-xl flex items-center transition-all shadow-2xl hover:scale-105 active:scale-95"
                            >
                                Start Exam
                                <ArrowRight className="ml-2 h-6 w-6" />
                            </button>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

function CheckItem({ icon: Icon, label, status, desc }: {
    icon: any,
    label: string,
    status: 'checking' | 'pass' | 'fail',
    desc: string
}) {
    return (
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${status === 'pass' ? 'bg-orange-600/5 border-orange-500/20' :
                status === 'fail' ? 'bg-red-500/5 border-red-500/20' :
                    'bg-slate-800/20 border-slate-800'
            }`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${status === 'pass' ? 'bg-orange-500/20' : 'bg-slate-800'}`}>
                    <Icon className={`h-5 w-5 ${status === 'pass' ? 'text-orange-500' : 'text-slate-400'}`} />
                </div>
                {status === 'checking' && <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />}
                {status === 'pass' && <CheckCircle2 className="h-5 w-5 text-orange-500" />}
                {status === 'fail' && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
            <div>
                <p className="font-bold text-lg text-slate-100">{label}</p>
                <p className="text-xs text-slate-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}
