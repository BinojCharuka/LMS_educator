export default function LandingFooter() {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-300 py-14 px-6 border-t border-slate-800">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-display font-bold text-white text-xl">Educator</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xs">
            Sri Lanka's premier focused online tuition platform. Expert-led, result-driven, fully digital.
          </p>
          {/* Social links */}
          <div className="flex gap-3">
            {[
              { label: 'FB', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
              { label: 'IG', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
              { label: 'YT', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z"/><polygon points="9.75 15.02 15.5 11.54 9.75 8.07 9.75 15.02"/></svg> },
              { label: 'WA', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> }
            ].map(s => (
              <div key={s.label} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-primary-600 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all duration-300 border border-slate-700/50">
                {s.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            {[['#courses','Courses'],['#teacher','About Teacher'],['#reviews','Reviews'],['#contact','Contact Us']].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-slate-400 hover:text-primary-400 transition-colors">{label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact details */}
        <div>
          <h3 className="font-semibold text-white mb-4">Contact Details</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">WhatsApp</p>
                <a href="https://wa.me/94771234567" className="text-white hover:text-primary-400 transition-colors font-medium">+94 77 123 4567</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Email</p>
                <a href="mailto:educator.lms@gmail.com" className="text-white hover:text-primary-400 transition-colors font-medium">educator.lms@gmail.com</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Address</p>
                <p className="text-white font-medium">No. 45, Galle Road,<br />Colombo 03, Sri Lanka</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-slate-800/80 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Educator LMS. All rights reserved.</p>
        <p className="text-slate-500 text-xs flex items-center gap-1.5">
          <span>Designed by</span>
          <a href="https://charudesignstudio.vercel.app" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-400 font-bold transition-all duration-300 decoration-dotted underline underline-offset-4">
            Charu Design Studio
          </a>
        </p>
      </div>
    </footer>
  );
}
