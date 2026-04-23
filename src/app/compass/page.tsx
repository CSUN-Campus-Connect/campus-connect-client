'use client';

import MatadorCompass from '@/components/compass/MatadorCompass';

export default function CompassPage() {
  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      <MatadorCompass compact={false} />
    </div>
  );
}
