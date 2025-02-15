import Lottie from 'lottie-react';
import animationData from '../assets/AnimationBike.json';

const LoadingAnimation = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
};

export default LoadingAnimation;