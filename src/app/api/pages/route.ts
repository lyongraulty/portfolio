import { NextResponse } from "next/server";
import { getPages } from "../../../../fetch/getPages";

export async function GET() {
  const pages = await getPages();
  return NextResponse.json(
    { pages },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
