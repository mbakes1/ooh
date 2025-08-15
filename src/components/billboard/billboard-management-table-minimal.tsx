"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Power,
  PowerOff,
  Plus,
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

interface BillboardManagementTableMinimalProps {
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

export function BillboardManagementTableMinimal({
  billboards,
  pagination,
  onPageChange,
  onStatusFilterChange,
  onRefresh,
  currentStatusFilter,
}: BillboardManagementTableMinimalProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { confirm: confirmDelete, ConfirmDialog: DeleteConfirmDialog } =
    useConfirmDialog({
      title: "Delete Billboard",
      description:
        "Are you sure you want to delete this billboard? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

  const handleStatusChange = async (billboardId: string, newStatus: string) => {
    setActionLoading(billboardId);
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
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (billboardId: string) => {
    confirmDelete(async () => {
      setActionLoading(billboardId);
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
      } finally {
        setActionLoading(null);
      }
    });
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

  const getPrimaryImage = (billboard: BillboardWithAnalytics) => {
    return billboard.images.find((img) => img.isPrimary) || billboard.images[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Billboards</h2>
          <p className="text-muted-foreground">
            Manage your billboard listings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={currentStatusFilter}
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/billboards/create">
              <Plus className="w-4 h-4 mr-2" />
              Add Billboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Billboard Grid */}
      {billboards.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No billboards yet</h3>
                <p className="text-muted-foreground">
                  Create your first billboard listing to get started
                </p>
              </div>
              <Button asChild>
                <Link href="/billboards/create">Create Billboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {billboards.map((billboard) => {
            const primaryImage = getPrimaryImage(billboard);
            const isLoading = actionLoading === billboard.id;

            return (
              <Card key={billboard.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-48 h-48 md:h-auto bg-muted flex-shrink-0">
                      {primaryImage ? (
                        <img
                          src={primaryImage.imageUrl}
                          alt={billboard.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {billboard.title}
                            </h3>
                            {getStatusBadge(billboard.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {billboard.address}, {billboard.city}
                          </p>
                          <p className="text-lg font-semibold text-primary">
                            {formatZAR(billboard.basePrice)}/day
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isLoading}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/billboards/${billboard.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/billboards/${billboard.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  billboard.id,
                                  billboard.status === "ACTIVE"
                                    ? "INACTIVE"
                                    : "ACTIVE"
                                )
                              }
                            >
                              {billboard.status === "ACTIVE" ? (
                                <>
                                  <PowerOff className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(billboard.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Created{" "}
                          {format(new Date(billboard.createdAt), "MMM d, yyyy")}
                        </span>
                        <span>
                          {billboard.analytics.totalInquiries} inquiries
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      <DeleteConfirmDialog />
    </div>
  );
}
