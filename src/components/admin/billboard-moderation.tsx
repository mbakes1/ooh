"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DataTable,
  createSortableHeader,
  createActionColumn,
  createCheckboxColumn,
} from "@/components/ui/data-table";
import { Billboard } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, Clock, MapPin } from "lucide-react";

interface BillboardModerationProps {
  billboards: Billboard[];
  onApproveBillboard: (billboardId: string) => void;
  onRejectBillboard: (billboardId: string, reason: string) => void;
  onViewBillboard: (billboardId: string) => void;
  onSuspendBillboard: (billboardId: string) => void;
  onBulkApproveBillboards?: (billboardIds: string[]) => void;
  onBulkRejectBillboards?: (billboardIds: string[], reason: string) => void;
  onBulkSuspendBillboards?: (billboardIds: string[]) => void;
}

export function BillboardModeration({
  billboards,
  onApproveBillboard,
  onRejectBillboard,
  onViewBillboard,
  onSuspendBillboard,
  onBulkApproveBillboards,
  onBulkRejectBillboards,
  onBulkSuspendBillboards,
}: BillboardModerationProps) {
  const columns: ColumnDef<Billboard>[] = [
    createCheckboxColumn(),
    {
      accessorKey: "title",
      header: createSortableHeader("Title"),
      cell: ({ row }) => {
        const billboard = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{billboard.title}</span>
            <span className="text-sm text-muted-foreground">
              Owner ID: {billboard.ownerId}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: createSortableHeader("Location"),
      cell: ({ row }) => {
        const billboard = row.original;
        return (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">
              {billboard.city}, {billboard.province}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusVariant = (status: string) => {
          switch (status) {
            case "ACTIVE":
              return "default";
            case "PENDING":
              return "secondary";
            case "REJECTED":
              return "destructive";
            case "SUSPENDED":
              return "destructive";
            default:
              return "secondary";
          }
        };

        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      accessorKey: "specifications",
      header: "Specifications",
      cell: ({ row }) => {
        const billboard = row.original;
        return (
          <div className="text-sm">
            <div>
              {billboard.width}×{billboard.height}
            </div>
            <div className="text-muted-foreground">{billboard.resolution}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "basePrice",
      header: createSortableHeader("Price"),
      cell: ({ row }) => {
        const price = row.getValue("basePrice") as number;
        const currency = row.original.currency || "ZAR";
        return (
          <span className="font-medium">
            {currency} {price?.toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: createSortableHeader("Submitted"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return formatDistanceToNow(new Date(date), { addSuffix: true });
      },
    },
    {
      id: "images",
      header: "Images",
      cell: ({ row }) => {
        const billboard = row.original;
        return <span className="text-sm">No image data</span>;
      },
    },
    createActionColumn<Billboard>([
      {
        label: "View Details",
        onClick: (billboard) => onViewBillboard(billboard.id),
      },
      {
        label: "Approve",
        onClick: (billboard) => onApproveBillboard(billboard.id),
      },
      {
        label: "Reject",
        onClick: (billboard) =>
          onRejectBillboard(billboard.id, "Content policy violation"),
        variant: "destructive",
      },
      {
        label: "Suspend",
        onClick: (billboard) => onSuspendBillboard(billboard.id),
        variant: "destructive",
      },
    ]),
  ];

  const pendingBillboards = billboards.filter(
    (b) => b.status === "PENDING"
  ).length;
  const activeBillboards = billboards.filter(
    (b) => b.status === "ACTIVE"
  ).length;
  const rejectedBillboards = billboards.filter(
    (b) => b.status === "REJECTED"
  ).length;
  const suspendedBillboards = billboards.filter(
    (b) => b.status === "SUSPENDED"
  ).length;

  const bulkActions = [
    {
      label: "Approve Selected",
      onClick: (selectedBillboards: Billboard[]) => {
        const billboardIds = selectedBillboards.map(
          (billboard) => billboard.id
        );
        onBulkApproveBillboards?.(billboardIds);
      },
      icon: CheckCircle,
    },
    {
      label: "Reject Selected",
      onClick: (selectedBillboards: Billboard[]) => {
        const billboardIds = selectedBillboards.map(
          (billboard) => billboard.id
        );
        onBulkRejectBillboards?.(billboardIds, "Bulk rejection");
      },
      variant: "destructive" as const,
      icon: XCircle,
    },
    {
      label: "Suspend Selected",
      onClick: (selectedBillboards: Billboard[]) => {
        const billboardIds = selectedBillboards.map(
          (billboard) => billboard.id
        );
        onBulkSuspendBillboards?.(billboardIds);
      },
      variant: "destructive" as const,
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBillboards}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBillboards}</div>
            <p className="text-xs text-muted-foreground">Approved and live</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedBillboards}</div>
            <p className="text-xs text-muted-foreground">Policy violations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspendedBillboards}</div>
            <p className="text-xs text-muted-foreground">
              Temporarily disabled
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billboard Moderation</CardTitle>
          <CardDescription>
            Review and moderate billboard listings for policy compliance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={billboards}
            searchKey="title"
            searchPlaceholder="Search billboards..."
            enableExport={true}
            exportFilename="billboards-moderation"
            enableBulkActions={true}
            bulkActions={bulkActions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
