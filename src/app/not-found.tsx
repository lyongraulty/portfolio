import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <section className="section">
      <Container>
        <h1>Page not found</h1>
        <p>The requested page does not exist.</p>
        <p>
          <Link href="/">Return home</Link>
        </p>
      </Container>
    </section>
  );
}
