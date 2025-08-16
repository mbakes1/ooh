"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Monitor,
  Eye,
  MessageSquare,
  Phone,
  Calendar,
  Zap,
  Ruler,
  Clock,
  Send,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatZAR } from "@/lib/utils";

interface BillboardWithDetails {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  province: string;
  postalCode: string | null;
  width: number;
  height: number;
  resolution: string | null;
  brightness: number | null;
  viewingDistance: number | null;
  trafficLevel: "HIGH" | "MEDIUM" | "LOW" | null;
  basePrice: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "REJECTED" | "SUSPENDED";
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    altText: string | null;
  }>;
  owner: {
    id: string;
    name: string;
    businessName: string | null;
    contactNumber: string | null;
    verified: boolean;
    avatarUrl: string | null;
  };
  _count: {
    conversations: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADVERTISER" | "ADMIN";
}

interface BillboardDetailViewProps {
  billboard: BillboardWithDetails;
  isOwner: boolean;
  currentUser: User | null;
}

export function BillboardDetailView({
  billboard,
  isOwner,
  currentUser,
}: BillboardDetailViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [, setShowInquiryForm] = useState(false);
  // const [, setShowAvailabilityCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [inquiryForm, setInquiryForm] = useState({
    subject: "",
    message: "",
    startDate: "",
    endDate: "",
    budget: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            Pending Review
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrafficLevelBadge = (level: string | null) => {
    if (!level) return null;

    const colors = {
      HIGH: "bg-red-100 text-red-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      LOW: "bg-green-100 text-green-800",
    };

    return (
      <Badge className={colors[level as keyof typeof colors]}>
        {level} Traffic
      </Badge>
    );
  };

  const primaryImage =
    billboard.images.find((img) => img.isPrimary) || billboard.images[0];

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billboardId: billboard.id,
          recipientId: billboard.owner.id,
          subject: inquiryForm.subject,
          message: inquiryForm.message,
          startDate: inquiryForm.startDate,
          endDate: inquiryForm.endDate,
          budget: inquiryForm.budget,
        }),
      });

      if (response.ok) {
        setShowInquiryForm(false);
        setInquiryForm({
          subject: "",
          message: "",
          startDate: "",
          endDate: "",
          budget: "",
        });
        // Show success message or redirect
        alert("Your inquiry has been sent successfully!");
      } else {
        throw new Error("Failed to send inquiry");
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const generateCalendarDays = () => {
  //   const start = startOfMonth(currentMonth);
  //   const end = endOfMonth(currentMonth);
  //   const days = eachDayOfInterval({ start, end });

  //   // Add days from previous month to fill the first week
  //   const startDay = start.getDay();
  //   const prevMonthDays = [];
  //   for (let i = startDay - 1; i >= 0; i--) {
  //     prevMonthDays.push(addDays(start, -i - 1));
  //   }

  //   // Add days from next month to fill the last week
  //   const endDay = end.getDay();
  //   const nextMonthDays = [];
  //   for (let i = 1; i <= 6 - endDay; i++) {
  //     nextMonthDays.push(addDays(end, i));
  //   }

  //   return [...prevMonthDays, ...days, ...nextMonthDays];
  // };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href={isOwner ? "/dashboard/billboards" : "/search"}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isOwner ? "Back to Dashboard" : "Back to Search"}
          </Button>
        </Link>

        {isOwner && (
          <div className="flex items-center space-x-2">
            <Link href={`/billboards/${billboard.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Listing
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          {billboard.images.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video relative overflow-hidden rounded-t-lg cursor-pointer group">
                  <img
                    src={
                      billboard.images[selectedImageIndex]?.imageUrl ||
                      primaryImage?.imageUrl
                    }
                    alt={billboard.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onClick={() => {
                      // Open image in new tab for full view
                      window.open(
                        billboard.images[selectedImageIndex]?.imageUrl ||
                          primaryImage?.imageUrl,
                        "_blank"
                      );
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {billboard.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {selectedImageIndex + 1} / {billboard.images.length}
                    </div>
                  )}
                </div>
                {billboard.images.length > 1 && (
                  <div className="p-4">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {billboard.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-12 rounded overflow-hidden border-2 transition-all hover:border-primary/50 ${
                            selectedImageIndex === index
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={image.imageUrl}
                            alt={`${billboard.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Click main image to view full size • Use thumbnails to
                      navigate
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Title and Description */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    {billboard.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mb-4">
                    {getStatusBadge(billboard.status)}
                    {billboard.trafficLevel &&
                      getTrafficLevelBadge(billboard.trafficLevel)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {formatZAR(Number(billboard.basePrice))}
                  </div>
                  <div className="text-sm text-muted-foreground">per day</div>
                </div>
              </div>
            </CardHeader>
            {billboard.description && (
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {billboard.description}
                </p>
              </CardContent>
            )}
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{billboard.address}</p>
                <p className="text-muted-foreground">
                  {billboard.city}, {billboard.province}
                  {billboard.postalCode && ` ${billboard.postalCode}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Specifications */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">
                    Display
                  </h4>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Ruler className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {billboard.width} × {billboard.height}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pixel Dimensions
                      </div>
                    </div>
                  </div>

                  {billboard.resolution && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Monitor className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {billboard.resolution}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Screen Resolution
                        </div>
                      </div>
                    </div>
                  )}

                  {billboard.brightness && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Zap className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {billboard.brightness} nits
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Brightness Level
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Viewing & Traffic */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">
                    Visibility
                  </h4>

                  {billboard.viewingDistance && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Eye className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {billboard.viewingDistance}m
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Optimal Viewing Distance
                        </div>
                      </div>
                    </div>
                  )}

                  {billboard.trafficLevel && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Traffic Volume</span>
                        {getTrafficLevelBadge(billboard.trafficLevel)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            billboard.trafficLevel === "HIGH"
                              ? "bg-red-500 w-full"
                              : billboard.trafficLevel === "MEDIUM"
                                ? "bg-yellow-500 w-2/3"
                                : "bg-green-500 w-1/3"
                          }`}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {billboard.trafficLevel === "HIGH" &&
                          "High visibility location with heavy foot/vehicle traffic"}
                        {billboard.trafficLevel === "MEDIUM" &&
                          "Moderate traffic area with good visibility"}
                        {billboard.trafficLevel === "LOW" &&
                          "Lower traffic area, suitable for targeted advertising"}
                      </p>
                    </div>
                  )}

                  {/* Operating Hours */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-semibold">6:00 AM - 10:00 PM</div>
                      <div className="text-sm text-muted-foreground">
                        Daily Operating Hours
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Advertising Guidelines
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    • Content must comply with South African advertising
                    standards
                  </p>
                  <p>
                    • Images should be high resolution for optimal display
                    quality
                  </p>
                  <p>• Animated content supported (GIF, MP4)</p>
                  <p>• Content review required before display</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics (Owner Only) */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {billboard._count.conversations}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Inquiries
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {billboard.status === "ACTIVE" ? "Live" : "Offline"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current Status
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {format(new Date(billboard.createdAt), "MMM yyyy")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Listed Since
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billboard Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={billboard.owner.avatarUrl || undefined} />
                  <AvatarFallback className="text-lg">
                    {billboard.owner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {billboard.owner.name}
                    </h3>
                    {billboard.owner.verified && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  {billboard.owner.businessName && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {billboard.owner.businessName}
                    </p>
                  )}

                  {/* Owner Stats */}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                    <span>
                      Member since{" "}
                      {format(new Date(billboard.createdAt), "yyyy")}
                    </span>
                    <span>•</span>
                    <span>{billboard._count.conversations} inquiries</span>
                  </div>

                  {/* Contact Information (for non-owners) */}
                  {!isOwner && currentUser && (
                    <div className="space-y-3">
                      {billboard.owner.contactNumber && (
                        <div className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {billboard.owner.contactNumber}
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          className="flex-1"
                          size="sm"
                          onClick={() => setShowInquiryForm(true)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        {billboard.owner.contactNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `tel:${billboard.owner.contactNumber}`
                              )
                            }
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Owner view */}
                  {isOwner && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        This is your billboard listing. Advertisers can contact
                        you through the platform.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listed</span>
                <span>
                  {format(new Date(billboard.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>
                  {format(new Date(billboard.updatedAt), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billboard ID</span>
                <span className="font-mono text-xs">
                  {billboard.id.slice(-8)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons (for non-owners) */}
          {!isOwner && currentUser && billboard.status === "ACTIVE" && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Inquiry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Send Inquiry to {billboard.owner.name}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleInquirySubmit}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={inquiryForm.subject}
                            onChange={(e) =>
                              setInquiryForm((prev) => ({
                                ...prev,
                                subject: e.target.value,
                              }))
                            }
                            placeholder="Advertising inquiry for your billboard"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={inquiryForm.startDate}
                              onChange={(e) =>
                                setInquiryForm((prev) => ({
                                  ...prev,
                                  startDate: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={inquiryForm.endDate}
                              onChange={(e) =>
                                setInquiryForm((prev) => ({
                                  ...prev,
                                  endDate: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            value={inquiryForm.message}
                            onChange={(e) =>
                              setInquiryForm((prev) => ({
                                ...prev,
                                message: e.target.value,
                              }))
                            }
                            placeholder="Tell us about your advertising campaign..."
                            rows={4}
                            required
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                          </DialogTrigger>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Inquiry
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Check Availability
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2" />
                          Availability Calendar
                        </DialogTitle>
                      </DialogHeader>
                      <div>
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMonth("prev")}
                          >
                            ←
                          </Button>
                          <h3 className="text-lg font-semibold">
                            {format(currentMonth, "MMMM yyyy")}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMonth("next")}
                          >
                            →
                          </Button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-4">
                          {[
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                          ].map((day) => (
                            <div
                              key={day}
                              className="text-center text-sm font-medium text-gray-500 py-2"
                            >
                              {day}
                            </div>
                          ))}
                          {Array.from({ length: 35 }, (_, index) => (
                            <div
                              key={index}
                              className="text-center text-sm py-2 cursor-pointer rounded hover:bg-green-100"
                            >
                              {index + 1}
                            </div>
                          ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-200 rounded mr-1"></div>
                            Available
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-200 rounded mr-1"></div>
                            Booked
                          </div>
                        </div>

                        {/* Booking Info */}
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Minimum Booking:</strong> 1 day
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Rate:</strong>{" "}
                            {formatZAR(Number(billboard.basePrice))} per day
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
