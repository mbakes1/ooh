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
import { User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { UserCheck, UserX, Shield } from "lucide-react";

interface UserWithCounts extends User {
  _count?: {
    billboards: number;
    sentMessages: number;
    receivedMessages: number;
  };
}

interface UserManagementProps {
  users: UserWithCounts[];
  onVerifyUser: (userId: string) => void;
  onSuspendUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onSendMessage: (userId: string) => void;
  onBulkVerifyUsers?: (userIds: string[]) => void;
  onBulkSuspendUsers?: (userIds: string[]) => void;
  onBulkDeleteUsers?: (userIds: string[]) => void;
}

export function UserManagement({
  users,
  onVerifyUser,
  onSuspendUser,
  onDeleteUser,
  onSendMessage,
  onBulkVerifyUsers,
  onBulkSuspendUsers,
  onBulkDeleteUsers,
}: UserManagementProps) {
  const columns: ColumnDef<UserWithCounts>[] = [
    createCheckboxColumn(),
    {
      accessorKey: "name",
      header: createSortableHeader("Name"),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: createSortableHeader("Role"),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant={role === "OWNER" ? "default" : "secondary"}>
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "verified",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        const isVerified = user.verified;
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={isVerified ? "default" : "destructive"}>
              {isVerified ? "Verified" : "Unverified"}
            </Badge>
            {user.suspended && <Badge variant="destructive">Suspended</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: "businessName",
      header: createSortableHeader("Business"),
      cell: ({ row }) => {
        const businessName = row.original.businessName;
        return businessName || "N/A";
      },
    },
    {
      accessorKey: "location",
      header: createSortableHeader("Location"),
      cell: ({ row }) => {
        const location = row.original.location;
        return location || "N/A";
      },
    },
    {
      accessorKey: "createdAt",
      header: createSortableHeader("Joined"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return formatDistanceToNow(new Date(date), { addSuffix: true });
      },
    },
    {
      id: "billboardCount",
      header: "Billboards",
      cell: ({ row }) => {
        const user = row.original;
        return user.role === "OWNER" ? user._count?.billboards || 0 : "N/A";
      },
    },
    createActionColumn<UserWithCounts>([
      {
        label: "Verify User",
        onClick: (user) => onVerifyUser(user.id),
      },
      {
        label: "Send Message",
        onClick: (user) => onSendMessage(user.id),
      },
      {
        label: "Suspend User",
        onClick: (user) => onSuspendUser(user.id),
        variant: "destructive",
      },
      {
        label: "Delete User",
        onClick: (user) => onDeleteUser(user.id),
        variant: "destructive",
      },
    ]),
  ];

  const verifiedUsers = users.filter((user) => user.verified).length;
  const unverifiedUsers = users.filter((user) => !user.verified).length;
  const owners = users.filter((user) => user.role === "OWNER").length;
  const advertisers = users.filter((user) => user.role === "ADVERTISER").length;

  const bulkActions = [
    {
      label: "Verify Selected",
      onClick: (selectedUsers: UserWithCounts[]) => {
        const userIds = selectedUsers.map((user) => user.id);
        onBulkVerifyUsers?.(userIds);
      },
      icon: UserCheck,
    },
    {
      label: "Suspend Selected",
      onClick: (selectedUsers: UserWithCounts[]) => {
        const userIds = selectedUsers.map((user) => user.id);
        onBulkSuspendUsers?.(userIds);
      },
      variant: "destructive" as const,
      icon: UserX,
    },
    {
      label: "Delete Selected",
      onClick: (selectedUsers: UserWithCounts[]) => {
        const userIds = selectedUsers.map((user) => user.id);
        onBulkDeleteUsers?.(userIds);
      },
      variant: "destructive" as const,
      icon: UserX,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {unverifiedUsers} pending verification
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Billboard Owners
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owners}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertisers</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advertisers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, verification status, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchKey="name"
            searchPlaceholder="Search users..."
            enableExport={true}
            exportFilename="users"
            enableBulkActions={true}
            bulkActions={bulkActions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
