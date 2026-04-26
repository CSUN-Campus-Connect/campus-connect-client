// src/app/clubs/[clubId]/edit/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClubEditPage from '@/components/clubs/ClubEdit/ClubEditPage';
import { MOCK_CLUB, MOCK_MEMBERS } from '@/components/clubs/ClubProfilePage';

export default function Page() {
  const router = useRouter();
  const [club, setClub] = useState(MOCK_CLUB);

  // BACKEND: check if current user has a leadership role before rendering
  // GET /api/clubs/:clubId/membership/me → { role: 'President' | 'VP' | 'Officer' | 'Member' }
  // if role === 'Member' → redirect to /clubs/:clubId

  return (
    <ClubEditPage
      club={club}
      members={MOCK_MEMBERS}
      onSave={(updated) => {
        setClub(updated);
        // BACKEND: after save, redirect back to club page
        router.push('/clubs/club-001');
      }}
      onBack={() => router.push('/clubs/club-001')}
    />
  );
}
