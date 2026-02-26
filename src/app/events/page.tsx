import { Suspense } from 'react';
import { EventApp } from '@/components/EventApp';

export default function EventsPage() {
  return (
    <Suspense>
      <EventApp showHomeLink />
    </Suspense>
  );
}
