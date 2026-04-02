import Spline from '@splinetool/react-spline';
import { useState } from 'react';

export default function SplineBrainScene() {
  const [isLoaded, setIsLoaded] = useState(false);

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
        onLoad={() => setIsLoaded(true)}
        style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
      />
    </div>
  );
}
