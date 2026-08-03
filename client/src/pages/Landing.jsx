import LandingNav          from '../components/landing/LandingNav';
import LandingHero         from '../components/landing/LandingHero';
import LandingStats        from '../components/landing/LandingStats';
import LandingCourses      from '../components/landing/LandingCourses';
import LandingTeacher      from '../components/landing/LandingTeacher';
import LandingHowItWorks   from '../components/landing/LandingHowItWorks';
import LandingTestimonials from '../components/landing/LandingTestimonials';
import LandingCTA          from '../components/landing/LandingCTA';
import LandingFooter       from '../components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <LandingHero />
      <LandingStats />
      <LandingCourses />
      <LandingTeacher />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
