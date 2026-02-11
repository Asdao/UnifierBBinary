import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { User, Volume2, VolumeX, LayoutDashboard, MessageSquare } from 'lucide-react';
import Chat from './features/chat/Chat';
import Dashboard from './features/dashboard/Dashboard';

function App() {
  const [autoSpeak, setAutoSpeak] = useState(() => {
    const saved = localStorage.getItem('autoSpeak');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleToggleAutoSpeak = () => {
    setAutoSpeak((prev: boolean) => {
      const next = !prev;
      localStorage.setItem('autoSpeak', JSON.stringify(next));
      return next;
    });
  };

  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="w-full min-h-screen relative bg-[#F8FAFC]">
      {/* Dynamic Minimalist Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full min-h-full p-[clamp(1rem,3vw,2rem)] grid grid-rows-[auto_1fr] gap-6 max-w-[1800px] mx-auto">

        {/* Persistent Header */}
        <header className="flex items-center justify-between shrink-0 bg-white/40 backdrop-blur-2xl border border-black/5 rounded-[32px] p-6 shadow-sm">
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">Aurora 👧</h1>
              <span className="text-[10px] font-bold tracking-[0.3em] opacity-40 uppercase text-slate-900">Intelligence Engine</span>
            </div>

            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!isDashboard ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Concierge
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isDashboard ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open('http://localhost:8081', '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
            >
              <span>🛡️</span> PathGuardian
            </button>

            <button
              onClick={() => window.open('http://localhost:3000', '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all"
            >
              <span>🙌</span> Sign Language
            </button>

            <button
              onClick={handleToggleAutoSpeak}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all border ${autoSpeak ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
              title={autoSpeak ? "Disable auto-speech" : "Enable auto-speech"}
            >
              {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:scale-105 transition-all">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="relative h-full">
          <Routes>
            <Route path="/" element={<Chat autoSpeak={autoSpeak} />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
