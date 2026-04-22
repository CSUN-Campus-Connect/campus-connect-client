// app/compass/page.tsx
// Full-page Matador Compass route

import MatadorCompass from '@/components/compass/MatadorCompass';

export const metadata = {
  title: 'Matador Compass — Student Success Guide | Toro CampusConnect',
  description: 'A step-by-step success roadmap for CSUN students — from Week 1 through graduation. Backed by research on 80,000+ college students.',
};

export default function CompassPage() {
  return <MatadorCompass compact={false} />;
}
