import { useRef, useEffect, useState, Suspense, lazy } from 'react';
import { ChevronDown } from 'lucide-react';
import Login from './Login';
import Footer from '@/components/layout/Footer';

const SplineBrainScene = lazy(() => import('@/components/SplineBrainScene'));

export default function Landing() {
  const loginRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const parallaxOffset = scrollY * 0.4;
  const heroOpacity = Math.max(0, 1 - scrollY * 0.002);

  return (
    <div className="scroll-smooth">
      {/* Welcome Section - Full Screen with Spline as background */}
      <section
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden bg-background"
      >
        {/* Full-screen Spline 3D Scene as background */}
        <div className="absolute inset-0 w-full h-full">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-background">
                <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              </div>
            }
          >
            <SplineBrainScene />
          </Suspense>
        </div>

        {/* Text overlay at bottom */}
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-28 sm:pb-32 px-4"
          style={{
            transform: `translateY(-${parallaxOffset}px)`,
            opacity: heroOpacity,
            willChange: 'transform, opacity',
          }}
        >
          {/* Company Name */}
          <h1
            className={`font-orbitron text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="text-primary">mind</span>
            <span className="text-foreground">care</span>
            <span className="text-primary">X</span>
          </h1>

          {/* Tagline */}
          <p
            className={`mt-3 font-jakarta text-lg text-muted-foreground sm:text-xl md:text-2xl transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Your Mental Wellness, Our Priority
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToLogin}
          className={`absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground transition-all hover:text-primary duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="text-xs sm:text-sm font-medium animate-pulse">Scroll to continue</span>
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 animate-bounce" />
        </button>
      </section>

      {/* Login Section */}
      <div ref={loginRef}>
        <Login />
      </div>

      <Footer />
    </div>
  );
}
