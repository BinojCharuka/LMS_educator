import { Link } from 'react-router-dom';

export default function LandingCTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-primary-600 to-violet-600 rounded-3xl px-8 py-14 text-center relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              Ready to Start Learning?
            </h2>
            <p className="text-primary-100 mb-8 text-lg max-w-xl mx-auto">
              Join 200+ Sri Lankan students building their future with Educator's expert-led online tuition.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all active:scale-95 shadow-lg">
                Register Now
              </Link>
              <Link to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-all">
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
