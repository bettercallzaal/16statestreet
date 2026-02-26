import { PageShell } from '@/components/PageShell';
import { ArtistDirectory } from '@/components/ArtistDirectory';

export default function ArtistsPage() {
  return (
    <PageShell title="Artist & Maker Directory">
      <ArtistDirectory />
    </PageShell>
  );
}
