'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    FileText,
    BrainCircuit,
    TrendingUp,
    AlertCircle,
    Clock,
    ChevronRight,
    Loader2
} from 'lucide-react';

interface AnalysisData {
    rawContent: string;
    verdict: 'PASS' | 'SUSPICIOUS' | 'FAIL';
    confidence: number;
    summary: string;
    analysis?: string;
}

export default function AnalysisDashboard() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalysisData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnalysis() {
            try {
                const response = await fetch('/api/analyze-report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}), // Empty body triggers 'latest' report
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to analyze report');
                }

                const result = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalysis();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="h-12 w-12 text-orange-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-slate-900">AI Analyzing Report...</h2>
                <p className="text-slate-500 mt-2">Reconstructing student workflow and detecting violations</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-6">
                    <ShieldX className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Analysis Failed</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const verdictStyles = {
        PASS: {
            icon: ShieldCheck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            label: 'Trusted Session'
        },
        SUSPICIOUS: {
            icon: ShieldAlert,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            label: 'Suspicious Activity'
        },
        FAIL: {
            icon: ShieldX,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100',
            label: 'Cheating Detected'
        }
    };

    const currentVerdict = data?.verdict || 'SUSPICIOUS';
    const style = verdictStyles[currentVerdict];
    const Icon = style.icon;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center space-x-2 text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            <span>Exam System</span>
                            <ChevronRight className="h-3 w-3" />
                            <span>AI Analysis</span>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-orange-600">Dashboard</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            AI Proctoring <span className="text-orange-600">Insights</span>
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Analysis Verified</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Log Data */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[700px]">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-slate-900 p-2 rounded-xl">
                                        <FileText className="text-white h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">Raw Integrity Log</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Direct recording feed</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 overflow-y-auto font-mono text-sm leading-relaxed bg-slate-900 text-slate-300 h-full">
                                {data?.rawContent.split('\n').map((line, i) => (
                                    <div key={i} className="mb-1">
                                        <span className="text-slate-600 mr-4 select-none">{(i + 1).toString().padStart(3, '0')}</span>
                                        {line}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Verdict */}
                    <div className="lg:col-span-5 space-y-8">

                        {/* Verdict Card */}
                        <div className={`rounded-[32px] border ${style.border} ${style.bg} p-10 shadow-xl relative overflow-hidden`}>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className={`p-5 rounded-3xl ${style.bg} border-4 border-white shadow-lg mb-6`}>
                                    <Icon className={`h-12 w-12 ${style.color}`} />
                                </div>
                                <p className={`text-xs font-black uppercase tracking-[0.3em] mb-2 ${style.color}`}>
                                    AI Integrity Verdict
                                </p>
                                <h2 className={`text-5xl font-black tracking-tighter mb-4 ${style.color}`}>
                                    {currentVerdict}
                                </h2>
                                <span className="px-6 py-2 bg-white rounded-full text-slate-700 text-xs font-black uppercase tracking-widest shadow-sm border border-slate-100">
                                    {style.label}
                                </span>

                                <div className="mt-10 w-full bg-white/50 p-6 rounded-2xl border border-white">
                                    <div className="flex justify-between items-end mb-3">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Cheating probability</p>
                                        <span className="text-lg font-black text-slate-900">{100 - (data?.confidence || 0)}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                                        <div
                                            className={`h-full transition-all duration-1000 ${currentVerdict === 'PASS' ? 'bg-emerald-500' : currentVerdict === 'SUSPICIOUS' ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${100 - (data?.confidence || 0)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                        </div>

                        {/* Analysis Summary */}
                        <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-xl">
                            <div className="flex items-center space-x-3 mb-8">
                                <div className="bg-orange-100 p-2 rounded-xl">
                                    <BrainCircuit className="text-orange-600 h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Reasoning</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Analysis Summary</p>
                                    <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        {data?.summary}
                                    </p>
                                </div>

                                {data?.analysis && (
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Detailed Reconstruction</p>
                                        <div className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                            {data.analysis}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Confidence</p>
                                    <p className="text-lg font-black text-slate-900">{data?.confidence}%</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Model Used</p>
                                    <p className="text-lg font-black text-slate-900">GPT-4o</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Rules */}
                        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-default">
                            <div className="relative z-10">
                                <div className="flex items-center space-x-2 mb-4">
                                    <AlertCircle className="text-orange-500 h-5 w-5" />
                                    <h4 className="font-black uppercase tracking-widest text-xs">Security Protocol 402</h4>
                                </div>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                                    This analysis is automated. In case of FAIL verdict, a human proctor review is mandatory before final action.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-slate-500" />
                                        <span className="text-[10px] font-mono text-slate-500">TS-2491-X</span>
                                    </div>
                                    <button className="text-[10px] font-black uppercase tracking-widest bg-orange-600 px-4 py-2 rounded-lg">
                                        Request Review
                                    </button>
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl" />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
