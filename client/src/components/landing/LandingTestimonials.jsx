const TESTIMONIALS = [
  { 
    name: 'Kavindi Perera',   
    grade: 'A/L Science',   
    text: 'My chemistry marks improved from C to A within two months! The live sessions and recordings gave me total flexibility to study at my own pace.',
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    name: 'Tharush Fernando', 
    grade: 'A/L Commerce',  
    text: 'The monthly PDF notes are outstanding. Everything is organized by topic and the teacher\'s explanations are crystal clear.',
    gradient: 'from-teal-400 to-emerald-600'
  },
  { 
    name: 'Amali Jayasinghe', 
    grade: 'A/L Maths',    
    text: 'Being able to check my results and track progress through the portal keeps me motivated every single week. Best investment!',
    gradient: 'from-amber-400 to-orange-600'
  },
  { 
    name: 'Dinesh Bandara',   
    grade: 'A/L Biology',   
    text: 'Live class links always on time and recordings available the same day. A true lifesaver for revision before exams.',
    gradient: 'from-purple-500 to-pink-600'
  },
];

const Stars = () => (
  <div className="flex gap-1 mb-4">
    {[1,2,3,4,5].map(i => (
      <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function LandingTestimonials() {
  return (
    <section id="reviews" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
      {/* Soft background glow circles */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-primary-100/30 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-violet-100/30 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Testimonials</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-800">What Our Students Say</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">Real results from real Educator learners across Sri Lanka.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {TESTIMONIALS.map(({ name, grade, text, gradient }) => (
            <div key={name} className="relative bg-white border border-slate-100/80 rounded-2xl p-8 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
              
              {/* Decorative Quote SVG Icon */}
              <svg className="w-12 h-12 text-slate-100/70 absolute top-6 right-6 transition-colors duration-300 group-hover:text-primary-500/10 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.85h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.85h3.983v10h-9.983z" />
              </svg>

              <div>
                <Stars />
                <p className="text-slate-600 text-sm leading-relaxed mb-6 relative z-10 italic">
                  "{text}"
                </p>
              </div>

              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0`}>
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{name}</p>
                  <p className="text-slate-400 text-xs font-medium">{grade}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
