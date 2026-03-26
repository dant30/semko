interface BreadcrumbsProps {
  items: string[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return <div className="ui-breadcrumbs">{items.join(" / ")}</div>;
}
