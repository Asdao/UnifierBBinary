import { useState, useRef, useEffect } from 'react';
import { generateContent } from '../../lib/genai';
import { Send, Mic, MicOff, LayoutDashboard, Trash2 } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { VectorStore } from '../../lib/memory';
import { Link } from 'react-router-dom';

interface ChatProps {
    autoSpeak: boolean;
}

function Chat({ autoSpeak }: ChatProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>(() => {
        const saved = localStorage.getItem('tom_chat_history');
        return saved ? JSON.parse(saved) : [
            { role: 'model', text: 'Welcome to your immersive Concierge. I have calibrated the interface for maximum tactile clarity and visual depth. How may I assist you today?' }
        ];
    });
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const {
        speak,
        cancel: cancelSpeech,
        isSpeaking,
        browserSupportsSpeechSynthesis
    } = useSpeechSynthesis();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        localStorage.setItem('tom_chat_history', JSON.stringify(messages));
    }, [messages, loading]);

    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    const handleSend = async (overrideMessage?: string) => {
        const messageToSend = overrideMessage || input;
        if (!messageToSend.trim() || loading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
        setLoading(true);

        if (isSpeaking) cancelSpeech();

        try {
            // 1. Retrieve relevant memories
            const context = await VectorStore.findRelevant(messageToSend);

            // 2. Generate content with memory
            const response = await generateContent(messageToSend, context);

            setMessages(prev => [...prev, { role: 'model', text: response }]);

            // 3. Save to memory in background
            VectorStore.addMessage('user', messageToSend);
            VectorStore.addMessage('model', response);

            if (autoSpeak && browserSupportsSpeechSynthesis) {
                speak(response);
            }
        } catch (error: any) {
            const errorText = error.message || "I encountered an error processing your request.";
            setMessages(prev => [...prev, { role: 'model', text: errorText }]);
            if (autoSpeak && browserSupportsSpeechSynthesis) {
                speak(errorText);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const clearChat = () => {
        const welcomeMessage = { role: 'model' as const, text: 'Welcome to your immersive Concierge. I have calibrated the interface for maximum tactile clarity and visual depth. How may I assist you today?' };
        setMessages([welcomeMessage]);
        localStorage.setItem('tom_chat_history', JSON.stringify([welcomeMessage]));
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto px-4">
            {/* Main Chat Area */}
            <main className="flex-1 no-scrollbar overflow-y-auto flex flex-col gap-6 py-8">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Label on the left side */}
                        {msg.role === 'model' && (
                            <div className="flex items-start pt-2">
                                <span className="text-5xl">
                                    👧
                                </span>
                            </div>
                        )}

                        {/* Message bubble */}
                        <div className={`max-w-[85%] p-6 rounded-3xl ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100'
                            : 'bg-white text-slate-800 rounded-tl-none border border-black/5 shadow-sm shadow-black/5'
                            }`}>
                            <p className="text-lg leading-relaxed font-medium">
                                {msg.text}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Dashboard Shortcut prompt after Aurora speaks */}
                {!loading && messages[messages.length - 1]?.role === 'model' && (
                    <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <Link
                            to="/dashboard"
                            className="bg-white/60 backdrop-blur-md border border-black/5 px-4 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-white transition-all shadow-sm"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            View Biometric Analysis
                        </Link>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center gap-3 ml-2 py-4">
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Footer / Input Container */}
            <footer className="shrink-0 pb-8 mt-4">
                <div className="bg-white border border-black/5 rounded-[32px] p-2 shadow-xl shadow-indigo-500/10 transition-all focus-within:shadow-indigo-500/15">
                    <div className="flex items-center gap-1">
                        {browserSupportsSpeechRecognition && (
                            <button
                                onClick={toggleListening}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        )}
                        <button
                            onClick={clearChat}
                            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                            title="Clear chat"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <input
                            className="flex-1 bg-transparent border-none text-slate-800 text-lg px-6 focus:ring-0 placeholder:text-slate-300 font-semibold outline-none"
                            placeholder={isListening ? "Listening..." : "How can I help you today?"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || (!input.trim() && !isListening)}
                            className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20 disabled:opacity-20 disabled:shadow-none"
                        >
                            <Send className="w-5 h-5 translate-x-0.5" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Chat;
