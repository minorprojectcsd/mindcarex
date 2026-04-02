import Spline from '@splinetool/react-spline';
import { useState, useCallback } from 'react';
import type { Application } from '@splinetool/runtime';

export default function SplineBrainScene() {
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback((splineApp: Application) => {
    setIsLoaded(true);
    // Zoom out the camera so the 3D object appears smaller on mobile
    const camera = splineApp.findObjectByType('PerspectiveCamera') as any;
    if (camera) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        camera.position.z = camera.position.z * 1.8;
      }
    }
  }, []);

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
