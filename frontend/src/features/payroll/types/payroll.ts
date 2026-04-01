export type PayrollPeriodStatus =
  | "draft"
  | "processing"
  | "completed"
  | "approved"
  | "locked"
  | string;

export interface PayrollPeriodRecord {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: PayrollPeriodStatus;
  notes?: string | null;
  approval_comment?: string | null;
  locked_at?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PayrollPeriodCreatePayload {
  name: string;
  start_date: string;
  end_date: string;
  notes?: string;
}
