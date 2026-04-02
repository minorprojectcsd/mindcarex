import Spline from '@splinetool/react-spline';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Application } from '@splinetool/runtime';

const getSplineZoom = (viewportWidth: number) => {
  if (viewportWidth < 400) return 0.56;
  if (viewportWidth < 640) return 0.64;
  if (viewportWidth < 768) return 0.76;
  return 1;
};

export default function SplineBrainScene() {
  const [isLoaded, setIsLoaded] = useState(false);
  const splineRef = useRef<Application | null>(null);

  const applySceneViewport = useCallback((splineApp: Application) => {
    splineApp.setZoom(getSplineZoom(window.innerWidth));

    const heroBackground = getComputedStyle(document.documentElement)
      .getPropertyValue('--hero-background')
      .trim();

    if (heroBackground) {
      splineApp.setBackgroundColor(`hsl(${heroBackground})`);
    }
  }, []);

  const onLoad = useCallback((splineApp: Application) => {
    splineRef.current = splineApp;
    applySceneViewport(splineApp);
    setIsLoaded(true);
  }, [applySceneViewport]);

  useEffect(() => {
    const handleResize = () => {
      if (splineRef.current) {
        applySceneViewport(splineRef.current);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => window.removeEventListener('resize', handleResize);
  }, [applySceneViewport]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-hero touch-pan-y">
      {/* Loading indicator until Spline loads */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-hero">
          <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
      <Spline
        scene="https://prod.spline.design/YKPcwgy1lZjBMXKb/scene.splinecode"
        onLoad={onLoad}
        style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
      />
    </div>
  );
}
