import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/Card";
import { DataTable, type Column as DataColumn } from "@/shared/components/tables";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { appRoutes } from "@/core/constants/routes";
import type { ClientRecord } from "@/features/clients/types/client";

interface ClientsTableProps {
  rows: ClientRecord[];
  isLoading: boolean;
}

export function ClientsTable({ rows, isLoading }: ClientsTableProps) {
  const columns: DataColumn<ClientRecord>[] = [
    {
      key: "name",
      header: "Client name",
      accessor: (row) => row.name,
      sortable: true,
    },
    {
      key: "code",
      header: "Client code",
      accessor: (row) => row.code || "—",
      sortable: true,
    },
    {
      key: "type",
      header: "Type",
      accessor: (row) => row.client_type.charAt(0).toUpperCase() + row.client_type.slice(1),
    },
    {
      key: "contact",
      header: "Contact",
      accessor: (row) => row.contact_person || "—",
    },
    {
      key: "phone",
      header: "Phone",
      accessor: (row) => row.phone_number || "—",
    },
    {
      key: "status",
      header: "Status",
      accessor: (row) => row.status.charAt(0).toUpperCase() + row.status.slice(1),
    },
  ];

  const navigate = useNavigate();

  if (!isLoading && rows.length === 0) {
    return (
      <Card className="overflow-hidden rounded-[2rem]">
        <EmptyState
          title="No clients found"
          description="Try broadening your filter criteria or adding new client accounts."
          className="min-h-[260px]"
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-[2rem]">
      <DataTable
        data={rows}
        columns={columns}
        keyPrefix="clients"
        isLoading={isLoading}
        className="rounded-none border-none shadow-none"
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(appRoutes.clientDetail(row.id))}
      />
    </Card>
  );
}
