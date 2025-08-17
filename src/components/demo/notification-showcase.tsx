"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";
import {
  User,
  Monitor,
  MessageSquare,
  Upload,
  DollarSign,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";

export function NotificationShowcase() {
  const notifications = useNotifications();
  const [promiseDemo, setPromiseDemo] = useState(false);

  const handlePromiseDemo = () => {
    if (promiseDemo) return;

    setPromiseDemo(true);

    const mockPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve({ success: true, data: "Demo data" });
        } else {
          reject(new Error("Demo error occurred"));
        }
      }, 3000);
    });

    notifications.promise(mockPromise, {
      loading: "Processing your request...",
      success: "Request completed successfully!",
      error: (error) => `Failed: ${error.message}`,
    });

    mockPromise.finally(() => {
      setPromiseDemo(false);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Notification System Showcase</h1>
        <p className="text-muted-foreground">
          Comprehensive notification system using Sonner with custom icons and
          styling
        </p>
      </div>

      <Tabs defaultValue="auth" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="billboard">Billboard</TabsTrigger>
          <TabsTrigger value="message">Message</TabsTrigger>
          <TabsTrigger value="file">File</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Authentication Notifications
              </CardTitle>
              <CardDescription>
                Login, registration, and session management notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => notifications.auth.loginSuccess("John Doe")}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Login Success
              </Button>
              <Button
                onClick={() =>
                  notifications.auth.loginError("Invalid credentials")
                }
                variant="outline"
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Login Error
              </Button>
              <Button
                onClick={() => notifications.auth.registrationSuccess()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Registration Success
              </Button>
              <Button
                onClick={() => notifications.auth.sessionExpired()}
                variant="outline"
                className="justify-start"
              >
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                Session Expired
              </Button>
              <Button
                onClick={() => notifications.auth.passwordResetSent()}
                variant="outline"
                className="justify-start"
              >
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                Password Reset Sent
              </Button>
              <Button
                onClick={() => notifications.auth.logoutSuccess()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Logout Success
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Billboard Notifications
              </CardTitle>
              <CardDescription>
                Billboard creation, updates, bookings, and interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() =>
                  notifications.billboard.createSuccess(
                    "Times Square Billboard"
                  )
                }
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Create Success
              </Button>
              <Button
                onClick={() =>
                  notifications.billboard.createError("Validation failed")
                }
                variant="outline"
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Create Error
              </Button>
              <Button
                onClick={() =>
                  notifications.billboard.favoriteAdded("Downtown Billboard")
                }
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Added to Favorites
              </Button>
              <Button
                onClick={() =>
                  notifications.billboard.bookingApproved("Highway Billboard")
                }
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Booking Approved
              </Button>
              <Button
                onClick={() => notifications.billboard.shareSuccess()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Link Copied
              </Button>
              <Button
                onClick={() =>
                  notifications.billboard.deleteSuccess("Old Billboard")
                }
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Delete Success
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="message" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messaging Notifications
              </CardTitle>
              <CardDescription>
                Message sending, receiving, and conversation management
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => notifications.message.sendSuccess()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Message Sent
              </Button>
              <Button
                onClick={() => notifications.message.sendError("Network error")}
                variant="outline"
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Send Error
              </Button>
              <Button
                onClick={() => notifications.message.newMessage("Alice Smith")}
                variant="outline"
                className="justify-start"
              >
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                New Message
              </Button>
              <Button
                onClick={() => notifications.message.conversationCreated()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Conversation Started
              </Button>
              <Button
                onClick={() => notifications.message.messageDeleted()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Message Deleted
              </Button>
              <Button
                onClick={() => notifications.message.conversationArchived()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Conversation Archived
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Upload Notifications
              </CardTitle>
              <CardDescription>
                File upload, download, and validation notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() =>
                  notifications.file.uploadSuccess("billboard-image.jpg")
                }
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Upload Success
              </Button>
              <Button
                onClick={() =>
                  notifications.file.uploadError(
                    "document.pdf",
                    "File too large"
                  )
                }
                variant="outline"
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Upload Error
              </Button>
              <Button
                onClick={() => notifications.file.fileSizeError()}
                variant="outline"
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                File Too Large
              </Button>
              <Button
                onClick={() => notifications.file.fileTypeError()}
                variant="outline"
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Invalid File Type
              </Button>
              <Button
                onClick={() => notifications.file.downloadSuccess("report.pdf")}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Download Success
              </Button>
              <Button
                onClick={() => {
                  const toastId =
                    notifications.file.uploadStart("large-file.zip");
                  setTimeout(() => notifications.dismiss(toastId), 3000);
                }}
                variant="outline"
                className="justify-start"
              >
                <Loader2 className="h-4 w-4 mr-2 text-blue-500" />
                Upload Progress
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile Notifications
              </CardTitle>
              <CardDescription>
                Profile updates, avatar changes, and account verification
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => notifications.user.profileUpdateSuccess()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Profile Updated
              </Button>
              <Button
                onClick={() =>
                  notifications.user.profileUpdateError("Validation failed")
                }
                variant="outline"
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Update Error
              </Button>
              <Button
                onClick={() => notifications.user.avatarUpdateSuccess()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Avatar Updated
              </Button>
              <Button
                onClick={() => notifications.user.emailVerificationSent()}
                variant="outline"
                className="justify-start"
              >
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                Verification Sent
              </Button>
              <Button
                onClick={() => notifications.user.emailVerified()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Email Verified
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Notifications
              </CardTitle>
              <CardDescription>
                Payment processing, success, and refund notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() =>
                  notifications.payment.paymentSuccess("R1,250.00")
                }
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Payment Success
              </Button>
              <Button
                onClick={() =>
                  notifications.payment.paymentError("Card declined")
                }
                variant="outline"
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Payment Failed
              </Button>
              <Button
                onClick={() => notifications.payment.paymentPending()}
                variant="outline"
                className="justify-start"
              >
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                Payment Pending
              </Button>
              <Button
                onClick={() => notifications.payment.refundProcessed("R750.00")}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Refund Processed
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Notifications
              </CardTitle>
              <CardDescription>
                User management and content moderation notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => notifications.admin.userPromoted("John Doe")}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                User Promoted
              </Button>
              <Button
                onClick={() => notifications.admin.userBanned("Spam User")}
                variant="outline"
                className="justify-start"
              >
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                User Banned
              </Button>
              <Button
                onClick={() =>
                  notifications.admin.userUnbanned("Reformed User")
                }
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                User Unbanned
              </Button>
              <Button
                onClick={() => notifications.admin.contentModerated()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Content Moderated
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Notifications
              </CardTitle>
              <CardDescription>
                Connection status, maintenance, and system updates
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => notifications.system.connectionRestored()}
                variant="outline"
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Connection Restored
              </Button>
              <Button
                onClick={() => notifications.system.connectionLost()}
                variant="outline"
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Connection Lost
              </Button>
              <Button
                onClick={() => notifications.system.maintenanceMode()}
                variant="outline"
                className="justify-start"
              >
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                Maintenance Mode
              </Button>
              <Button
                onClick={() => notifications.system.updateAvailable()}
                variant="outline"
                className="justify-start"
              >
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                Update Available
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5" />
            Promise-based Notifications
          </CardTitle>
          <CardDescription>
            Notifications that track async operations from start to finish
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handlePromiseDemo}
            disabled={promiseDemo}
            className="w-full"
          >
            {promiseDemo ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Promise Demo...
              </>
            ) : (
              "Demo Promise Notification"
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            This will show a loading notification, then either success or error
            based on random outcome.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utility Functions</CardTitle>
          <CardDescription>
            Additional notification management functions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={() => notifications.dismissAll()} variant="outline">
            Dismiss All Notifications
          </Button>
          <Button
            onClick={() => {
              notifications.generic.success(
                "Custom success message",
                "This is a custom description"
              );
            }}
            variant="outline"
          >
            Custom Generic Notification
          </Button>
        </CardContent>
      </Card>

      <div className="text-center space-y-2">
        <Badge variant="secondary" className="text-sm">
          Powered by Sonner + shadcn/ui
        </Badge>
        <p className="text-sm text-muted-foreground">
          All notifications are fully customizable with icons, descriptions,
          actions, and durations
        </p>
      </div>
    </div>
  );
}
