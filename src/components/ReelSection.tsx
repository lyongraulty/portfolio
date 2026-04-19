import { Section } from "@/components/Section";
import { ModalLink } from "@/components/ModalLink";
import { isLikelyVideoUrl } from "@/lib/mediaUrl";
import { getCardMediaFromBackground, getPageButtonText, getPageProjectCopy, getPageTitle } from "@/lib/pageData";
import { getPages } from "../../fetch/getPages";

function formatIndex(value: unknown): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "01";
  }
  return String(Math.max(1, Math.floor(numeric))).padStart(2, "0");
}

export async function ReelSection() {
  const pages = await getPages();
  const reelPage = pages.find((page) => String(page.page ?? "") === "1") ?? pages[0];
  const reelPageId = String(reelPage?.page ?? "1");
  const title = getPageTitle(reelPage) || "MOTION REEL";
  const buttonText = getPageButtonText(reelPage) || "View Reel";
  const index = formatIndex(reelPage?.page);
  const description = getPageProjectCopy(reelPage) || "A tightly edited compilation of recent work - both client and personal";
  const cardBackground = getCardMediaFromBackground(reelPage)?.src ?? "";
  const backgroundType = isLikelyVideoUrl(cardBackground) ? "video" : "image";
  const reelStyle =
    cardBackground && backgroundType === "image" ? { ["--reel-bg" as string]: `url("${cardBackground}")` } : undefined;

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
      data-reel-bg-type={backgroundType}
      aria-labelledby="reel-heading"
      style={reelStyle}
    >
      {cardBackground && backgroundType === "video" ? (
        <video
          className="reel-bg-video"
          src={cardBackground}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      ) : null}
      <article className="reel-shell">
        <h2 id="reel-heading">{title}</h2>
        <p className="reel-action">
          <ModalLink className="reel-button type-button" modal="project-page" page={reelPageId}>
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
