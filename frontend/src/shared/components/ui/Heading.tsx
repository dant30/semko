import type { PropsWithChildren } from "react";

interface HeadingProps extends PropsWithChildren {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

const headingSizes: Record<NonNullable<HeadingProps["as"]>, string> = {
  h1: "text-5xl md:text-6xl",
  h2: "text-4xl md:text-5xl",
  h3: "text-3xl md:text-4xl",
  h4: "text-2xl md:text-3xl",
  h5: "text-xl md:text-2xl",
  h6: "text-lg md:text-xl",
};

export function Heading({
  as: Component = "h2",
  className = "",
  children,
}: HeadingProps) {
  return (
    <Component
      className={`font-heading tracking-tight ${headingSizes[Component]} font-semibold ${className}`}
    >
      {children}
    </Component>
  );
}
