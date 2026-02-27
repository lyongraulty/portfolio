import { NextResponse } from "next/server";
import { getPages } from "../../../../fetch/getPages";

export async function GET() {
  const pages = await getPages();
  return NextResponse.json({ pages });
}
