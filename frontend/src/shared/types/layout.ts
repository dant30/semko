export interface LayoutStat {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
}

export interface NavigationSection {
  title: string;
  items: Array<{
    label: string;
    path: string;
    icon?: string;
  }>;
}
