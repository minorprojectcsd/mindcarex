import Spline from '@splinetool/react-spline';

export default function SplineBrainScene() {
  return (
    <div className="w-full h-full">
      <Spline
        scene="https://prod.spline.design/YKPcwgy1lZjBMXKb/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}