import React from 'react';
import { Composition } from 'remotion';
import { AifV4Promo } from './AifV4Promo';

export const Root: React.FC = () => {
  return (
    <Composition
      id="AifV4Promo"
      component={AifV4Promo}
      durationInFrames={900}
      fps={60}
      width={1920}
      height={1080}
    />
  );
};
