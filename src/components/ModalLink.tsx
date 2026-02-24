"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode } from "react";

type ModalLinkProps = {
  modal: "reel" | "contact" | "music" | "sandbox" | "project";
  slug?: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

export function ModalLink({ modal, slug, className, children, ...rest }: ModalLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  params.set("modal", modal);
  if (slug) {
    params.set("slug", slug);
  } else {
    params.delete("slug");
  }

  const query = params.toString();
  const href = query ? `${pathname}?${query}` : pathname;

  return (
    <Link href={href} scroll={false} className={className} {...rest}>
      {children}
    </Link>
  );
}
