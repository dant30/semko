export type MaterialCategory = "aggregate" | "tarmac" | "sand" | "dust" | "other";
export type MaterialUnitOfMeasure = "tonne" | "cubic_meter" | "trip";

export interface MaterialRecord {
  id: number;
  name: string;
  code: string;
  category: MaterialCategory;
  unit_of_measure: MaterialUnitOfMeasure;
  description?: string;
  density_factor?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface MaterialFormValues {
  name: string;
  code: string;
  category: MaterialCategory;
  unit_of_measure: MaterialUnitOfMeasure;
  description: string;
  density_factor: string;
  is_active: boolean;
}

export interface MaterialFilters {
  search: string;
  category: "" | MaterialCategory;
  unitOfMeasure: "" | MaterialUnitOfMeasure;
  activeOnly: boolean;
}

