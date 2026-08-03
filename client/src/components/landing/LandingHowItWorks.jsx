const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="14" height="16" rx="2" stroke="#597ef7" strokeWidth="2" />
        <path d="M9 3H15V6H9V3Z" fill="#eff2fc" stroke="#597ef7" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="9" cy="11" r="1.5" fill="#597ef7" />
        <circle cx="9" cy="15" r="1.5" fill="#597ef7" />
        <line x1="12" y1="11" x2="16" y2="11" stroke="#597ef7" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="15" x2="16" y2="15" stroke="#597ef7" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Register & Choose',
    desc: 'Create your free account and select the subjects you want to study.'
  },
  {
    num: '02',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="#13c2c2" strokeWidth="2" />
        <path d="M3 10H21" stroke="#13c2c2" strokeWidth="2" />
        <rect x="6" y="13" width="4" height="2" rx="0.5" fill="#e6fffb" stroke="#13c2c2" strokeWidth="1.5" />
        <circle cx="16" cy="14" r="1.5" fill="#13c2c2" />
      </svg>
    ),
    title: 'Pay & Get Verified',
    desc: 'Upload your monthly bank slip. The teacher reviews and approves your access within hours.'
  },
  {
    num: '03',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C12 2 17 7 17 13C17 15.5 15.5 17 12 17C8.5 17 7 15.5 7 13C7 7 12 2 12 2Z" fill="#f9f0ff" stroke="#722ed1" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="2" fill="white" stroke="#722ed1" strokeWidth="1.5" />
        <path d="M9 17L6 21H18L15 17" stroke="#722ed1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17V22" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 19.5L12 22L14 19.5" stroke="#ff4d4f" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Learn & Grow',
    desc: 'Access live classes, download PDF notes, and watch recordings — all in one dashboard.'
  },
];

export default function LandingHowItWorks() {
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-800">How It Works</h2>
          <p className="text-slate-500 mt-3">Get started in three easy steps.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-primary-100" />

          {STEPS.map(({ num, icon, title, desc }, i) => (
            <div key={num} className="flex flex-col items-center text-center relative">
              {/* Icon circle */}
              <div className="w-20 h-20 rounded-full bg-white border-2 border-primary-100 shadow-md flex items-center justify-center mb-5 relative z-10">
                {icon}
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
              </div>
              <h3 className="font-display font-bold text-slate-800 text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
