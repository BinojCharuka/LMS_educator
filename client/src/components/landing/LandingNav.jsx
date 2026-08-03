import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="font-display font-bold text-slate-800 text-xl">Educator</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[['#courses','Courses'],['#teacher','About'],['#reviews','Reviews'],['#contact','Contact']].map(([href, label]) => (
            <a key={href} href={href} className="text-slate-600 hover:text-primary-600 text-sm font-medium transition-colors">{label}</a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors px-3 py-2">Log In</Link>
          <Link to="/register" className="text-sm font-semibold bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg transition-all hover:shadow-md hover:shadow-primary-200 active:scale-95">Register</Link>
        </div>
      </div>
    </nav>
  );
}
