export type ClientType = "corporate" | "individual";
export type ClientStatus = "active" | "inactive" | "suspended";

export interface ClientRecord {
  id: number;
  name: string;
  code: string;
  client_type: ClientType;
  contact_person?: string;
  phone_number?: string;
  alternate_phone_number?: string;
  email?: string;
  address?: string;
  town?: string;
  county?: string;
  status: ClientStatus;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClientFormValues {
  name: string;
  code: string;
  client_type: ClientType;
  contact_person: string;
  phone_number: string;
  alternate_phone_number: string;
  email: string;
  address: string;
  town: string;
  county: string;
  status: ClientStatus;
  notes: string;
  is_active: boolean;
}

export interface ClientFilters {
  search: string;
  clientType: "" | ClientType;
  status: "" | ClientStatus;
  activeOnly: boolean;
}
