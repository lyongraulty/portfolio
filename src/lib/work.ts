export type WorkItem = {
  slug: string;
  title: string;
  year: string;
  category: string;
  summary: string;
  detail: string;
  media?: {
    type: "video" | "image";
    src: string;
  };
};

export const workItems: WorkItem[] = [
  {
    slug: "sellout-film-title-sequence",
    title: "SEllout - film title sequence",
    year: "2024",
    category: "Title Design",
    summary: "Title design for a feature film - a longtime goal, realized frame by frame",
    detail: "Title design for a feature film - a longtime goal, realized frame by frame.",
    media: {
      type: "image",
      src: "https://static1.squarespace.com/static/586488fed482e92ded46e4d8/t/68475ca4546dda494a25f2ac/1749507237082/Sellout_3x1_03.png",
    },
  },
  {
    slug: "drumwave",
    title: "DRUMWAVE",
    year: "2024",
    category: "Motion Design",
    summary: "Making the invisible architecture of your data feel personal",
    detail: "Making the invisible architecture of your data feel personal.",
    media: {
      type: "video",
      src: "https://static1.squarespace.com/static/586488fed482e92ded46e4d8/t/6844b1469201243ca96a7752/1749332301834/DrumWave_3x1_V01.mp4",
    },
  },
  {
    slug: "reebok-sustainability",
    title: "REEBOK - SUSTAINABILITY",
    year: "2024",
    category: "3D Motion",
    summary: "A fun mix of materials explorations, bouncy simulations and buttery smooth animation",
    detail: "A fun mix of materials explorations, bouncy simulations and buttery smooth animation.",
    media: {
      type: "video",
      src: "https://static1.squarespace.com/static/586488fed482e92ded46e4d8/t/66e50b685bf8c75851015ebd/1726286697357/BlackMath_ReebokSustainability_3x1.mp4",
    },
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
    media: {
      type: "image",
      src: "https://images.squarespace-cdn.com/content/586488fed482e92ded46e4d8/2ba775d0-f572-46a0-9795-21a463545c29/Anheuser_Busch_02_2x1_v2.png?content-type=image%2Fpng",
    },
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
    media: {
      type: "video",
      src: "https://static1.squarespace.com/static/586488fed482e92ded46e4d8/t/6847568dd4487541274735c2/1749505679583/TexasMonthly_TRIM_3x1.mp4",
    },
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
    media: {
      type: "video",
      src: "https://static1.squarespace.com/static/586488fed482e92ded46e4d8/t/6847569cdd1e555f15c7c47e/1749505694840/NETRMA_SafeDriving_TRIM_3x1.mp4",
    },
  },
  {
    slug: "ash-britt-disaster-relief",
    title: "Ash britt - Disaster Relief",
    year: "2022",
    category: "Direction",
    summary: "I provided design, animation and direction for this compelling story about hope and redemption.",
    detail: "I provided design, animation and direction for this compelling story about hope and redemption.",
    media: {
      type: "image",
      src: "https://static1.squarespace.com/static/586488fed482e92ded46e4d8/t/6844bd2e7a718e0fcfa9a10c/1749335344628/AshBritt_02_3x1+%280-00-10-17%29.png",
    },
  },
  {
    slug: "lyft",
    title: "LYFT",
    year: "2022",
    category: "Brand Motion",
    summary: "Some fun animation for a major brand",
    detail: "Some fun animation for a major brand.",
    media: {
      type: "image",
      src: "https://static1.squarespace.com/static/586488fed482e92ded46e4d8/t/68b21068ceefb74e1b01f3e2/1756500072287/Lyft_3x1_03.png",
    },
  },
];

export function getWorkBySlug(slug: string) {
  return workItems.find((item) => item.slug === slug);
}
