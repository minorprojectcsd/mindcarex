import Spline from '@splinetool/react-spline';
import { useState, useCallback, useEffect, useRef } from 'react';

export default function SplineBrainScene() {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onLoad = useCallback((splineApp: any) => {
    setIsLoaded(true);
    try {
      // Try to zoom out the camera on mobile
      const allObjects = splineApp.getAllObjects?.();
      if (allObjects) {
        const camera = allObjects.find((o: any) => o.type === 'PerspectiveCamera');
        if (camera && window.innerWidth < 768) {
          camera.position.z = camera.position.z * 1.6;
        }
      }
    } catch (e) {
      // Camera manipulation not supported, fall back to CSS scale
    }
  }, []);

  // CSS fallback: scale canvas down on mobile so the 3D object looks smaller
  useEffect(() => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector('canvas');
    if (canvas && window.innerWidth < 768) {
      canvas.style.transform = 'scale(0.65)';
      canvas.style.transformOrigin = 'center center';
    }
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-hero touch-pan-y">
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
