import { Container } from "@/components/Container";

export function MusicSection() {
  return (
    <section id="music" className="section section-compact" aria-labelledby="music-heading">
      <Container className="centered-copy">
        <h2 id="music-heading">Music</h2>
        <p>Selected tracks and playlists that influence timing, mood, and editing decisions.</p>
      </Container>
    </section>
  );
}
