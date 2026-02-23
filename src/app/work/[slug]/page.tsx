import { notFound } from "next/navigation";
import { ProjectOverlayWindow } from "@/components/ProjectOverlayWindow";
import { getWorkBySlug, workItems } from "@/lib/work";

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return workItems.map((item) => ({ slug: item.slug }));
}

export default async function WorkDetailPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const item = getWorkBySlug(slug);

  if (!item) {
    notFound();
  }

  const index = workItems.findIndex((workItem) => workItem.slug === item.slug) + 2;

  return <ProjectOverlayWindow title={item.title} description={item.summary} index={index} />;
}
