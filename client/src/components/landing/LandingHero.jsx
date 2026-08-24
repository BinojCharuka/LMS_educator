import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function LandingHero() {
  const [teacher, setTeacher] = useState({
    name: 'Mr. Suresh',
    qualifications: 'M.Sc. | B.Ed. Hons.',
    imageUrl: ''
  });

  useEffect(() => {
    api.get('/proxy/settings/landing-teacher')
      .then(res => {
        if (res.data?.setting) {
          setTeacher(res.data.setting);
          // If there is no custom image, signal that we are ready immediately
          if (!res.data.setting.imageUrl) {
            window.dispatchEvent(new Event('app-ready'));
          }
        } else {
          window.dispatchEvent(new Event('app-ready'));
        }
      })
      .catch((err) => {
        console.error(err);
        window.dispatchEvent(new Event('app-ready'));
      });
  }, []);

  return (
    <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-slate-50 via-white to-primary-50 overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

        {/* Left — Text */}
        <div>
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            Enrolling Now — 2025 Academic Year
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-800 leading-tight mb-4">
            Learn and Grow<br />
            with <span className="text-primary-600">Expert</span> Guidance
          </h1>

          <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
            Join Sri Lanka's most trusted online tuition platform. Master in-demand skills with live classes, curated PDF notes, recorded sessions, and personalised results.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link to="/register" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-200 active:scale-95">
              Get Started Free →
            </Link>
            <a href="#courses" className="inline-flex items-center gap-2 border border-slate-200 hover:border-primary-300 text-slate-700 hover:text-primary-600 font-semibold px-6 py-3 rounded-xl transition-all bg-white">
              View Courses
            </a>
          </div>

          {/* Inline social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['K','T','A','D','S'].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: ['#6366f1','#8b5cf6','#0d9488','#f59e0b','#ec4899'][i] }}>
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'.split('').map((s, i) => <span key={i} className="text-sm">{s}</span>)}
              </div>
              <p className="text-slate-500 text-xs">200+ students enrolled</p>
            </div>
          </div>
        </div>

        {/* Right — Visual card */}
        <div className="relative flex justify-center lg:justify-end mt-10 lg:mt-0">
          
          {teacher.imageUrl ? (
            <div className="relative w-full max-w-sm lg:max-w-md flex justify-center items-end">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-primary-400/20 blur-[80px] rounded-full" />
              
              {/* Floating Image */}
              <img 
                src={teacher.imageUrl} 
                alt={teacher.name} 
                onLoad={() => window.dispatchEvent(new Event('app-ready'))}
                onError={() => window.dispatchEvent(new Event('app-ready'))}
                className="relative z-10 w-full h-auto max-h-[500px] object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] transition-transform duration-700 hover:-translate-y-2" 
              />
              
              {/* Floating Name Badge */}
              <div className="absolute top-12 -left-8 lg:-left-24 z-30 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl px-6 py-3 border border-white/50 text-left whitespace-nowrap">
                <p className="font-display font-bold text-slate-800 text-lg">{teacher.name}</p>
                <p className="text-primary-600 text-sm font-medium">{teacher.qualifications}</p>
              </div>
            </div>
          ) : (
            <div className="relative w-80 h-96 rounded-3xl bg-gradient-to-br from-primary-600 to-violet-600 shadow-2xl shadow-primary-200 flex items-center justify-center overflow-hidden z-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
              <div className="text-center text-white px-8 relative z-20 w-full">
                <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">🎓</div>
                <p className="font-display font-bold text-2xl line-clamp-1">{teacher.name}</p>
                <p className="text-primary-200 text-sm mt-1 line-clamp-1">{teacher.qualifications}</p>
                <p className="text-white/80 text-xs mt-3 leading-relaxed">12+ Years of dedicated teaching experience in Advanced Level subjects</p>
              </div>
            </div>
          )}

          {/* Floating stat card */}
          <div className="absolute -bottom-6 -left-8 lg:-left-16 z-30 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-lg">✓</div>
            <div>
              <p className="font-bold text-slate-800 text-sm">98% Pass Rate</p>
              <p className="text-slate-400 text-xs">Avg. 2 grade improvement</p>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -top-6 -right-6 lg:-right-12 z-30 bg-white rounded-2xl shadow-xl px-4 py-3 border border-slate-100">
            <p className="text-xs text-slate-500">Active Students</p>
            <p className="font-display font-bold text-primary-600 text-xl">200+</p>
          </div>
        </div>
      </div>
    </section>
  );
}
