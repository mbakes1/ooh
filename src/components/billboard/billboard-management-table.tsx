"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  createSortableHeader,
  createCheckboxColumn,
} from "@/components/ui/data-table";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Power,
  PowerOff,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatZAR } from "@/lib/utils";
import Image from "next/image";

interface BillboardWithAnalytics {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  province: string;
  basePrice: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
  analytics: {
    totalInquiries: number;
  };
}

interface BillboardManagementTableProps {
  billboards: BillboardWithAnalytics[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
  onPageChange: (page: number) => void;
  onStatusFilterChange: (status: string) => void;
  onRefresh: () => void;
  currentStatusFilter: string;
}

export function BillboardManagementTable({
  billboards,
  pagination,
  onStatusFilterChange,
  onRefresh,
  currentStatusFilter,
}: BillboardManagementTableProps) {
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const { confirm: confirmDelete, ConfirmDialog: DeleteConfirmDialog } =
    useConfirmDialog({
      title: "Delete Billboard",
      description:
        "Are you sure you want to delete this billboard? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

  const { confirm: confirmBulkAction, ConfirmDialog: BulkActionConfirmDialog } =
    useConfirmDialog({
      title: "Bulk Action",
      description:
        "Are you sure you want to perform this action on the selected billboards?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "destructive",
    });

  const handleStatusChange = async (billboardId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/billboards/${billboardId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      onRefresh();
    } catch (error) {
      console.error("Error updating status:", error);
      // TODO: Add toast notification
    }
  };

  const handleDelete = async (billboardId: string) => {
    confirmDelete(async () => {
      try {
        const response = await fetch(`/api/billboards/${billboardId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete billboard");
        }

        onRefresh();
      } catch (error) {
        console.error("Error deleting billboard:", error);
        // TODO: Add toast notification
      }
    });
  };

  const handleBulkAction = async (
    action: string,
    selectedBillboards: BillboardWithAnalytics[]
  ) => {
    if (selectedBillboards.length === 0) return;

    confirmBulkAction(async () => {
      setBulkActionLoading(true);
      try {
        const response = await fetch("/api/billboards/bulk-actions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            billboardIds: selectedBillboards.map((b) => b.id),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to perform bulk action");
        }

        onRefresh();
      } catch (error) {
        console.error("Error performing bulk action:", error);
        // TODO: Add toast notification
      } finally {
        setBulkActionLoading(false);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="border-yellow-300 text-yellow-700 bg-yellow-50"
          >
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<BillboardWithAnalytics>[] = useMemo(
    () => [
      createCheckboxColumn(),
      {
        accessorKey: "title",
        header: createSortableHeader("Title"),
        cell: ({ row }) => {
          const billboard = row.original;
          const primaryImage =
            billboard.images.find((img) => img.isPrimary) ||
            billboard.images[0];

          return (
            <div className="flex items-center space-x-3">
              {primaryImage && (
                <div className="relative w-12 h-8 flex-shrink-0">
                  <Image
                    src={primaryImage.imageUrl}
                    alt={billboard.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{billboard.title}</div>
                {billboard.description && (
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    {billboard.description}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
          const billboard = row.original;
          return (
            <div className="text-sm">
              <div className="font-medium">
                {billboard.city}, {billboard.province}
              </div>
              <div className="text-muted-foreground truncate max-w-xs">
                {billboard.address}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "basePrice",
        header: createSortableHeader("Price"),
        cell: ({ row }) => {
          const billboard = row.original;
          return (
            <div>
              <div className="font-medium">
                {formatZAR(Number(billboard.basePrice))}
              </div>
              <div className="text-sm text-muted-foreground">per day</div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.status),
        filterFn: (row, id, value) => {
          return value === "all" || row.getValue(id) === value;
        },
      },
      {
        accessorKey: "inquiries",
        header: createSortableHeader("Inquiries"),
        cell: ({ row }) => {
          const billboard = row.original;
          return (
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>{billboard.analytics.totalInquiries}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: createSortableHeader("Created"),
        cell: ({ row }) => {
          return (
            <div className="text-sm">
              {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const billboard = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/billboards/${billboard.id}`}>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                </Link>
                <Link href={`/billboards/${billboard.id}/edit`}>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                {billboard.status === "ACTIVE" ? (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(billboard.id, "INACTIVE")}
                  >
                    <PowerOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(billboard.id, "ACTIVE")}
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(billboard.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleStatusChange, handleDelete]
  );

  const bulkActions = [
    {
      label: "Activate",
      onClick: (selectedRows: BillboardWithAnalytics[]) =>
        handleBulkAction("activate", selectedRows),
      icon: Power,
    },
    {
      label: "Deactivate",
      onClick: (selectedRows: BillboardWithAnalytics[]) =>
        handleBulkAction("deactivate", selectedRows),
      icon: PowerOff,
    },
    {
      label: "Delete",
      onClick: (selectedRows: BillboardWithAnalytics[]) =>
        handleBulkAction("delete", selectedRows),
      variant: "destructive" as const,
      icon: Trash2,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Billboard Listings</CardTitle>
            <div className="flex items-center space-x-4">
              {/* Status Filter */}
              <Select
                value={currentStatusFilter}
                onValueChange={onStatusFilterChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={billboards}
            searchKey="title"
            searchPlaceholder="Search billboards..."
            enableBulkActions={true}
            bulkActions={bulkActions}
            enableExport={true}
            exportFilename="billboard-listings"
            pageSize={pagination.limit}
          />

          {billboards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No billboards found.</p>
              <Link href="/billboards/create">
                <Button className="mt-4">Create Your First Billboard</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <DeleteConfirmDialog />
      <BulkActionConfirmDialog />
    </>
  );
}
