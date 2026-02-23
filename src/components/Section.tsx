import type { ComponentPropsWithoutRef } from "react";
import { Container } from "@/components/Container";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  fullBleed?: boolean;
  containerClassName?: string;
  size?: "large" | "medium" | "small";
};

export function Section({
  children,
  className = "",
  fullBleed = false,
  containerClassName = "",
  size = "medium",
  ...props
}: SectionProps) {
  return (
    <section className={`section section--${size} ${className}`.trim()} {...props}>
      {fullBleed ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  );
}
