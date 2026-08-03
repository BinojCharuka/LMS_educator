import { Link } from 'react-router-dom';

const OFFERINGS = [
  {
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="liveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7875" />
            <stop offset="100%" stopColor="#ff4d4f" />
          </linearGradient>
          <filter id="glowLive" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#ff4d4f" floodOpacity="0.4" />
          </filter>
        </defs>
        <circle cx="32" cy="32" r="28" fill="#fff1f0" opacity="0.6"/>
        <rect x="14" y="16" width="36" height="26" rx="6" fill="white" stroke="#ff4d4f" strokeWidth="2.5" />
        <circle cx="32" cy="29" r="6" fill="url(#liveGrad)" />
        <circle cx="32" cy="29" r="2" fill="white" />
        <path d="M26 42 L22 49 M38 42 L42 49 M32 42 L32 46" stroke="#ff4d4f" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="44" cy="22" r="3.5" fill="#ff4d4f" filter="url(#glowLive)" className="animate-pulse" />
      </svg>
    ),
    tag: 'LIVE',
    tagColor: 'bg-red-100 text-red-600',
    title: 'Live Online Classes',
    desc: 'Weekly interactive sessions via Google Meet. Real-time Q&A with the teacher every class.',
    features: ['Live Q&A every session', 'Recorded within 24h', 'Scheduled by A/L calendar'],
    price: 'Monthly subscription',
    color: 'border-primary-100 hover:border-primary-300',
    badge: 'bg-primary-600',
  },
  {
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pdfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#36cfc9" />
            <stop offset="100%" stopColor="#13c2c2" />
          </linearGradient>
          <filter id="glowPdf" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#13c2c2" floodOpacity="0.3" />
          </filter>
        </defs>
        <circle cx="32" cy="32" r="28" fill="#e6fffb" opacity="0.6"/>
        <path d="M20 12 H38 L46 20 V50 C46 52.2 44.2 54 42 54 H20 C17.8 54 16 52.2 16 50 V14 C16 11.8 17.8 12 20 12 Z" fill="white" stroke="#13c2c2" strokeWidth="2.5" filter="url(#glowPdf)" />
        <path d="M38 12 V20 H46" fill="#e6fffb" stroke="#13c2c2" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="22" y1="28" x2="40" y2="28" stroke="#13c2c2" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="36" x2="40" y2="36" stroke="#13c2c2" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="44" x2="32" y2="44" stroke="#13c2c2" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    tag: 'PDF',
    tagColor: 'bg-teal-100 text-teal-700',
    title: 'Curated PDF Notes',
    desc: 'Topic-wise notes, past paper analysis and model answers crafted by the teacher.',
    features: ['Topic-wise coverage', 'Past paper answers', 'Download anytime'],
    price: 'Included in plan',
    color: 'border-teal-100 hover:border-teal-300',
    badge: 'bg-teal-600',
  },
  {
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="vidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b37feb" />
            <stop offset="100%" stopColor="#722ed1" />
          </linearGradient>
          <filter id="glowVid" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#722ed1" floodOpacity="0.3" />
          </filter>
        </defs>
        <circle cx="32" cy="32" r="28" fill="#f9f0ff" opacity="0.6"/>
        <rect x="14" y="18" width="36" height="28" rx="6" fill="white" stroke="#722ed1" strokeWidth="2.5" filter="url(#glowVid)" />
        <path d="M28 26 L38 32 L28 38 Z" fill="url(#vidGrad)" stroke="#722ed1" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="48" cy="22" r="2" fill="#722ed1" />
        <circle cx="16" cy="44" r="1.5" fill="#722ed1" />
      </svg>
    ),
    tag: 'VIDEO',
    tagColor: 'bg-violet-100 text-violet-700',
    title: 'Video Recordings',
    desc: 'Full lesson recordings on YouTube (private). Rewatch at your own pace anytime.',
    features: ['Unlisted YouTube links', 'Segmented by topic', 'New uploads weekly'],
    price: 'Included in plan',
    color: 'border-violet-100 hover:border-violet-300',
    badge: 'bg-violet-600',
  },
];

export default function LandingCourses() {
  return (
    <section id="courses" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">What We Offer</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-800">Available Courses</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">Three powerful learning formats — combined to take you from beginner to distinction level.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {OFFERINGS.map(({ icon, tag, tagColor, title, desc, features, price, color, badge }) => (
            <div key={title} className={`rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg cursor-pointer bg-white ${color}`}>
              {/* Thumbnail mockup */}
              <div className="w-full h-36 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                {icon}
                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded ${tagColor}`}>{tag}</span>
              </div>

              <h3 className="font-display font-bold text-slate-800 text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{desc}</p>

              <ul className="space-y-1.5 mb-5">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                    <svg className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{price}</span>
                <Link to="/register"
                  className={`text-xs font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 ${badge}`}>
                  Enroll Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
