'use client';

import React, { useState } from 'react';
import ProctoringGateway from './gateway';
import SystemCheck from './SystemCheck';
import Instructions from './Instructions';
import CameraView from '@/components/proctor/CameraView';

type FlowStep = 'gateway' | 'system-check' | 'instructions' | 'exam';

export default function ExamPage() {
  const [step, setStep] = useState<FlowStep>('gateway');

  const handleStartSystemCheck = () => {
    setStep('system-check');
  };

  const handleGoToInstructions = () => {
    setStep('instructions');
  };

  const handleStartExam = () => {
    setStep('exam');
  };

  if (step === 'gateway') {
    return <ProctoringGateway onStart={handleStartSystemCheck} />;
  }

  if (step === 'system-check') {
    return <SystemCheck onComplete={handleGoToInstructions} />;
  }

  if (step === 'instructions') {
    return <Instructions onStart={handleStartExam} />;
  }

  // Final Exam Step - Now with Active Camera Monitoring
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row p-6 gap-6">
      {/* Left side: Exam Questions */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="inline-block px-4 py-1.5 bg-red-600/10 text-red-500 text-xs font-black uppercase tracking-[0.2em] rounded-full border border-red-500/20 mb-8 animate-pulse">
            ● Live Proctoring Active
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">Python Basics v2</h1>
          <p className="text-slate-500 font-medium mb-10 text-sm">Exam in progress. All violations are logged.</p>

          <div className="p-10 bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <span className="text-orange-500 font-bold uppercase tracking-widest text-xs">Question 1 of 40</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed">
              What is the output of <code className="text-orange-400">print(2**3)</code>?
            </h3>

            <div className="space-y-4">
              {['6', '8', '9', '23'].map((option, i) => (
                <button key={i} className="w-full text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-all font-bold text-slate-300">
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Proctored Camera View */}
      <div className="w-full md:w-80 flex flex-col items-center justify-start pt-12">
        <div className="sticky top-12">
          <CameraView />
        </div>
      </div>
    </div>
  );
}