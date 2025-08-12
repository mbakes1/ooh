"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatZAR } from "@/lib/utils";

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
  onPageChange,
  onStatusFilterChange,
  onRefresh,
  currentStatusFilter,
}: BillboardManagementTableProps) {
  const [selectedBillboards, setSelectedBillboards] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBillboards(billboards.map((b) => b.id));
    } else {
      setSelectedBillboards([]);
    }
  };

  const handleSelectBillboard = (billboardId: string, checked: boolean) => {
    if (checked) {
      setSelectedBillboards((prev) => [...prev, billboardId]);
    } else {
      setSelectedBillboards((prev) => prev.filter((id) => id !== billboardId));
    }
  };

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
    if (
      !confirm(
        "Are you sure you want to delete this billboard? This action cannot be undone."
      )
    ) {
      return;
    }

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
  };

  const handleBulkAction = async (action: string) => {
    if (selectedBillboards.length === 0) return;

    const actionText = action === "delete" ? "delete" : `${action} selected`;
    if (
      !confirm(
        `Are you sure you want to ${actionText} ${selectedBillboards.length} billboard(s)?`
      )
    ) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const response = await fetch("/api/billboards/bulk-actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          billboardIds: selectedBillboards,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform bulk action");
      }

      setSelectedBillboards([]);
      onRefresh();
    } catch (error) {
      console.error("Error performing bulk action:", error);
      // TODO: Add toast notification
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="border-yellow-300 text-yellow-700"
          >
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
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

            {/* Bulk Actions */}
            {selectedBillboards.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedBillboards.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("activate")}
                  disabled={bulkActionLoading}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("deactivate")}
                  disabled={bulkActionLoading}
                >
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction("delete")}
                  disabled={bulkActionLoading}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={
                    selectedBillboards.length === billboards.length &&
                    billboards.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inquiries</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billboards.map((billboard) => (
              <TableRow key={billboard.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedBillboards.includes(billboard.id)}
                    onChange={(e) =>
                      handleSelectBillboard(billboard.id, e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {billboard.images.length > 0 && (
                      <img
                        src={
                          billboard.images.find((img) => img.isPrimary)
                            ?.imageUrl || billboard.images[0].imageUrl
                        }
                        alt={billboard.title}
                        className="w-12 h-8 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{billboard.title}</div>
                      {billboard.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {billboard.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>
                      {billboard.city}, {billboard.province}
                    </div>
                    <div className="text-muted-foreground truncate max-w-xs">
                      {billboard.address}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {formatZAR(Number(billboard.basePrice))}
                  </div>
                  <div className="text-sm text-muted-foreground">per day</div>
                </TableCell>
                <TableCell>{getStatusBadge(billboard.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{billboard.analytics.totalInquiries}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(billboard.createdAt), "MMM dd, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                          onClick={() =>
                            handleStatusChange(billboard.id, "INACTIVE")
                          }
                        >
                          <PowerOff className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(billboard.id, "ACTIVE")
                          }
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {billboards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No billboards found.</p>
            <Link href="/billboards/create">
              <Button className="mt-4">Create Your First Billboard</Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.pages ||
                      Math.abs(page - pagination.page) <= 1
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={
                          page === pagination.page ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => onPageChange(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
