import { Section } from "@/components/Section";
import { ModalLink } from "@/components/ModalLink";
import { getPages } from "../../fetch/getPages";

function formatIndex(value: string | number | undefined): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "01";
  }
  return String(Math.max(1, Math.floor(numeric))).padStart(2, "0");
}

export async function ReelSection() {
  const pages = await getPages();
  const reelPage = pages.find((page) => String(page.page ?? "") === "1") ?? pages[0];
  const title = String(reelPage?.title ?? "MOTION REEL");
  const buttonText = String(reelPage?.["button-text"] ?? "View Reel");
  const index = formatIndex(reelPage?.page);
  const description = String(
    reelPage?.["project-copy"] ?? "A tightly edited compilation of recent work - both client and personal",
  );
  const cardBackground =
    (reelPage?.["card-background"] as string | undefined) ||
    (reelPage?.["card_background"] as string | undefined) ||
    (reelPage?.["card background"] as string | undefined) ||
    "";
  const reelStyle = cardBackground ? { ["--reel-bg" as string]: `url("${cardBackground}")` } : undefined;

  if (process.env.NODE_ENV !== "production" && !cardBackground) {
    console.warn("Reel card_background missing from page data", reelPage);
  }

  return (
    <Section
      id="reel"
      size="medium"
      className="reel-section"
      data-tone="dark"
      data-hover-zone="reel"
      aria-labelledby="reel-heading"
      style={reelStyle}
    >
      <article className="reel-shell">
        <h2 id="reel-heading">{title}</h2>
        <p className="reel-action">
          <ModalLink className="reel-button type-button" modal="reel">
            {buttonText}
          </ModalLink>
        </p>
        <p className="reel-index type-overline">{index}.</p>
        <p className="reel-divider type-overline">-</p>
        <p className="reel-description type-caption" style={{ whiteSpace: "pre-line" }}>
          {description}
        </p>
      </article>
    </Section>
  );
}
