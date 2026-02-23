export type WorkItem = {
  slug: string;
  title: string;
  year: string;
  category: string;
  summary: string;
  detail: string;
};

export const workItems: WorkItem[] = [
  {
    slug: "colossal-biosciences-the-dire-wolf",
    title: "Colossal Biosciences - The dire wolf",
    year: "2025",
    category: "Motion Design",
    summary: "Motion design for a high-profile launch that blended science, storytelling, and spectacle",
    detail: "Motion design for a high-profile launch that blended science, storytelling, and spectacle.",
  },
  {
    slug: "sellout-film-title-sequence",
    title: "SEllout - film title sequence",
    year: "2024",
    category: "Title Design",
    summary: "Title design for a feature film - a longtime goal, realized frame by frame",
    detail: "Title design for a feature film - a longtime goal, realized frame by frame.",
  },
  {
    slug: "drumwave",
    title: "DRUMWAVE",
    year: "2024",
    category: "Motion Design",
    summary: "Making the invisible architecture of your data feel personal",
    detail: "Making the invisible architecture of your data feel personal.",
  },
  {
    slug: "reebok-sustainability",
    title: "REEBOK - SUSTAINABILITY",
    year: "2024",
    category: "3D Motion",
    summary: "A fun mix of materials explorations, bouncy simulations and buttery smooth animation",
    detail: "A fun mix of materials explorations, bouncy simulations and buttery smooth animation.",
  },
  {
    slug: "anheuser-busch",
    title: "ANHEUSER-BUSCH",
    year: "2023",
    category: "Brand Animation",
    summary:
      "A liquid gold logo reveal for the Anheuser Busch rebrand - 3D animation in service of a classic American company",
    detail:
      "A liquid gold logo reveal for the Anheuser Busch rebrand - 3D animation in service of a classic American company.",
  },
  {
    slug: "texas-monthly",
    title: "Texas Monthly",
    year: "2023",
    category: "Editorial Motion",
    summary:
      "A collection of my editorial work for Texas Monthly: animated covers and custom animated illustrations",
    detail:
      "A collection of my editorial work for Texas Monthly: animated covers and custom animated illustrations.",
  },
  {
    slug: "safe-driving-campaign",
    title: "Safe Driving Campaign",
    year: "2023",
    category: "Campaign",
    summary:
      "I was tasked with designing, directing and animating this series of social media shorts promoting safe driving.",
    detail:
      "I was tasked with designing, directing and animating this series of social media shorts promoting safe driving.",
  },
  {
    slug: "ash-britt-disaster-relief",
    title: "Ash britt - Disaster Relief",
    year: "2022",
    category: "Direction",
    summary: "I provided design, animation and direction for this compelling story about hope and redemption.",
    detail: "I provided design, animation and direction for this compelling story about hope and redemption.",
  },
  {
    slug: "lyft",
    title: "LYFT",
    year: "2022",
    category: "Brand Motion",
    summary: "Some fun animation for a major brand",
    detail: "Some fun animation for a major brand.",
  },
];

export function getWorkBySlug(slug: string) {
  return workItems.find((item) => item.slug === slug);
}
