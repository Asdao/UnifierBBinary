import { useRef, useEffect, useState, useCallback } from 'react';
import { Shield, Activity, Heart, Brain, Info, Clock, Box } from 'lucide-react';
import { useVisionPipeline } from '../../hooks/useVisionPipeline';
import { VectorStore } from '../../lib/memory';

interface TimelineEvent {
    id: string;
    type: 'emotion' | 'object' | 'system';
    message: string;
    timestamp: string;
    icon: any;
}

export default function Dashboard() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { emotion, objects, isFalling, isHydrating, isLoading, error } = useVisionPipeline(videoRef.current);
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const lastObservationRef = useRef<Record<string, number>>({}); // Tracking last event times
    const lastEmotionRef = useRef<string>("");

    // Start camera feed
    useEffect(() => {
        let stream: MediaStream | null = null;
        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied:", err);
            }
        }

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Helper to add activity with change detection
    const addActivity = useCallback((message: string, type: 'emotion' | 'object' | 'system', icon: any, priority: boolean = false) => {
        const now = Date.now();
        const lastTime = lastObservationRef.current[message] || 0;

        // Selective logic: Only add if unique OR it's been more than 30s for the same thing
        // (Unless it's a priority event like a fall)
        if (priority || now - lastTime > 30000) {
            const newEvent: TimelineEvent = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                icon
            };
            setEvents((prev: TimelineEvent[]) => [newEvent, ...prev].slice(0, 10));
            VectorStore.addObservation(message);
            lastObservationRef.current[message] = now;
        }
    }, []);

    // Sync Significant Emotion Changes
    useEffect(() => {
        if (emotion.confidence > 85 && emotion.emotion !== lastEmotionRef.current) {
            addActivity(`User is feeling ${emotion.emotion} Resonance`, 'emotion', Heart);
            lastEmotionRef.current = emotion.emotion;
        }
    }, [emotion, addActivity]);

    // Sync New Object Detections
    useEffect(() => {
        if (objects.length > 0) {
            objects.forEach(obj => {
                if (obj.score > 0.8) {
                    addActivity(`${obj.category.charAt(0).toUpperCase() + obj.category.slice(1)} identified`, 'object', Box);
                }
            });
        }
    }, [objects, addActivity]);

    // Sync Hydration Events
    useEffect(() => {
        if (isHydrating) {
            addActivity("User is hydrating ☕", 'system', Activity);
        }
    }, [isHydrating, addActivity]);

    // Sync Fall Events (High Priority)
    useEffect(() => {
        if (isFalling) {
            addActivity("CRITICAL: FALL DETECTED", 'system', Shield, true);
        }
    }, [isFalling, addActivity]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700 h-full">
            {/* Fall Alert Overlay */}
            {isFalling && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div className="bg-red-600/90 backdrop-blur-xl border-4 border-white p-12 rounded-[50px] shadow-[0_0_100px_rgba(220,38,38,0.5)] animate-bounce text-white flex flex-col items-center gap-6">
                        <Shield className="w-20 h-20 animate-pulse text-white" />
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Fall Detected</h2>
                        <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Notifying caregivers immediately...</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Main Vision Feed */}
                <div className={`${isFalling ? 'scale-95 grayscale' : ''} transition-all duration-700 lg:col-span-2 flex flex-col gap-6`}>
                    <div className="relative aspect-video rounded-3xl overflow-hidden glass-orb shadow-2xl group bg-slate-100">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover brightness-110 contrast-110"
                        />

                        {/* Status Overlay */}
                        <div className="absolute top-6 left-6 flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white/40 shadow-sm z-10">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${error ? 'bg-red-500' : isFalling ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                {isLoading ? 'Calibrating...' : error ? 'System Error' : isFalling ? 'EMERGENCY' : isHydrating ? 'HYDRATING' : 'Live Awareness'}
                            </span>
                        </div>

                        {/* Detection Bounding Boxes Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-20">
                            {objects.map((obj, i) => obj.bbox && (
                                <div
                                    key={i}
                                    className="absolute border-2 border-indigo-500/40 bg-indigo-500/5 rounded-lg transition-all duration-300"
                                    style={{
                                        left: `${(obj.bbox.originX / (videoRef.current?.videoWidth || 640)) * 100}%`,
                                        top: `${(obj.bbox.originY / (videoRef.current?.videoHeight || 480)) * 100}%`,
                                        width: `${(obj.bbox.width / (videoRef.current?.videoWidth || 640)) * 100}%`,
                                        height: `${(obj.bbox.height / (videoRef.current?.videoHeight || 480)) * 100}%`
                                    }}
                                >
                                    <span className="absolute -top-6 left-0 text-[8px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter whitespace-nowrap shadow-md">
                                        {obj.category} {(obj.score * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Biometric Analysis Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-6 rounded-3xl glass-orb text-center flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
                            <Heart className={`w-5 h-5 ${emotion.emotion === 'Happy' ? 'text-pink-500' : 'text-slate-400'}`} />
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Resonance</span>
                            <span className="text-xl font-black lowercase">{emotion.emotion}</span>
                        </div>
                        <div className="p-6 rounded-3xl glass-orb text-center flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Hydration</span>
                            <span className="text-xl font-black lowercase">{isHydrating ? 'Active' : 'Secure'}</span>
                        </div>
                        <div className="p-6 rounded-3xl glass-orb text-center flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
                            <Shield className={`w-5 h-5 ${isFalling ? 'text-red-600 animate-pulse' : 'text-emerald-500'}`} />
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Safety</span>
                            <span className="text-xl font-black lowercase">{isFalling ? 'FALLEN' : 'Secure'}</span>
                        </div>
                        <div className="p-6 rounded-3xl glass-orb text-center flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
                            <Brain className="w-5 h-5 text-purple-500" />
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Processing</span>
                            <span className="text-xl font-black lowercase">Edge</span>
                        </div>
                    </div>
                </div>

                {/* Activity Timeline Section */}
                <div className="flex flex-col gap-6">
                    <div className="p-8 rounded-3xl glass-orb flex-1 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Live Activity</h3>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
                            {events.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                    <Info className="w-12 h-12 mb-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Calibrating situational awareness...</p>
                                </div>
                            ) : (
                                events.map((event: TimelineEvent) => (
                                    <div key={event.id} className={`group relative pl-6 border-l py-1 transition-all ${event.message.includes('FALL') ? 'border-red-500 bg-red-50/50 -mx-4 px-8 rounded-xl' : 'border-slate-100 hover:border-indigo-500'} animate-in slide-in-from-left duration-500`}>
                                        <div className={`absolute -left-[5px] top-2.5 w-[9px] h-[9px] rounded-full border bg-white group-hover:bg-indigo-500 transition-all ${event.message.includes('FALL') ? 'border-red-600 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'border-slate-200'}`} />
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={`text-[8px] font-black uppercase tracking-tighter italic ${event.message.includes('FALL') ? 'text-red-600' : 'text-indigo-500/50'}`}>
                                                    {event.timestamp}
                                                </span>
                                                <event.icon className={`w-3 h-3 ${event.message.includes('FALL') ? 'text-red-600' : 'text-slate-300'}`} />
                                            </div>
                                            <p className={`text-[11px] font-bold leading-tight ${event.message.includes('FALL') ? 'text-red-900' : 'text-slate-700'}`}>
                                                {event.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                            <div className="flex items-start gap-4">
                                <Brain className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                                <p className="text-[10px] font-bold text-indigo-900/60 leading-relaxed uppercase tracking-tighter">
                                    Strategic Analysis: Aurora is currently processing your environment for supportive context.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
