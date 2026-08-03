export default function LandingTeacher() {
  const quals = [
    'M.Sc. Physical Science — University of Colombo',
    'B.Ed. Honours — National Institute of Education',
    'Former Senior Teacher — Royal College, Colombo',
    'Combined Maths & Physics specialist',
    '90%+ students achieve A or B grades',
    'Online tuition since 2019',
  ];

  return (
    <section id="teacher" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

        {/* Photo card */}
        <div className="flex justify-center lg:justify-start">
          <div className="relative">
            <div className="w-64 h-72 rounded-3xl bg-gradient-to-br from-primary-500 to-violet-600 flex flex-col items-center justify-center shadow-xl shadow-primary-100">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl mb-3">👨‍🏫</div>
              <p className="font-display font-bold text-white text-lg">Mr. Suresh J.</p>
              <p className="text-primary-200 text-sm">M.Sc. | B.Ed. Hons.</p>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3 text-center">
              <p className="font-display font-extrabold text-primary-600 text-2xl">12+</p>
              <p className="text-slate-500 text-xs">Years Teaching</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">About The Teacher</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Expert Guidance for<br />A/Level Success
          </h2>
          <p className="text-slate-500 leading-relaxed mb-6">
            With over 12 years of dedicated teaching, Mr. Suresh has guided hundreds of students to outstanding A/L results. His method combines conceptual clarity, exam strategy, and consistent practise.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
            {quals.map(q => (
              <div key={q} className="flex items-start gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {q}
              </div>
            ))}
          </div>

          <a href="#contact"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-200 active:scale-95">
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
