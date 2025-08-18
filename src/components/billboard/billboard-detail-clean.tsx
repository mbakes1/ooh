"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Monitor,
  Eye,
  MessageSquare,
  Phone,
  Star,
  Zap,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { formatZAR } from "@/lib/utils";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

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

interface BillboardDetailCleanProps {
  billboard: BillboardWithDetails;
  isOwner: boolean;
  currentUser: User | null;
}

export function BillboardDetailClean({
  billboard,
  isOwner,
  currentUser,
}: BillboardDetailCleanProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    subject: "",
    message: "",
    startDate: "",
    endDate: "",
    budget: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTrafficColor = (level: string | null) => {
    if (!level) return "bg-gray-50 text-gray-700";
    switch (level) {
      case "HIGH":
        return "bg-red-50 text-red-700";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700";
      case "LOW":
        return "bg-green-50 text-green-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
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
        setInquiryForm({
          subject: "",
          message: "",
          startDate: "",
          endDate: "",
          budget: "",
        });
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

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === billboard.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? billboard.images.length - 1 : prev - 1
    );
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          label: isOwner ? "Dashboard" : "Explore Billboards",
          href: isOwner ? "/dashboard/billboards" : "/search",
        },
        { label: billboard.title },
      ]}
      title={billboard.title}
      description={`${billboard.address}, ${billboard.city}, ${billboard.province} • ${formatZAR(Number(billboard.basePrice))} per day`}
    >
      <div className="space-y-8">
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {billboard.owner.verified && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                <Star className="h-3 w-3 mr-1" />
                Verified Owner
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatZAR(Number(billboard.basePrice))}
            </div>
            <div className="text-sm text-muted-foreground">per day</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {billboard.images.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted group">
                  <Image
                    src={
                      billboard.images[selectedImageIndex]?.imageUrl ||
                      primaryImage?.imageUrl ||
                      "/placeholder-billboard.svg"
                    }
                    alt={billboard.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {billboard.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImageIndex + 1} / {billboard.images.length}
                      </div>
                    </>
                  )}
                </div>

                {billboard.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {billboard.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Image
                          src={image.imageUrl}
                          alt={`${billboard.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {billboard.description && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">About This Billboard</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {billboard.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Specifications</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Specs */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Monitor className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-medium">Display</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Dimensions
                        </span>
                        <span className="font-medium">
                          {billboard.width}m × {billboard.height}m
                        </span>
                      </div>
                      {billboard.resolution && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Resolution
                          </span>
                          <span className="font-medium">
                            {billboard.resolution}
                          </span>
                        </div>
                      )}
                      {billboard.brightness && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Brightness
                          </span>
                          <span className="font-medium">
                            {billboard.brightness} nits
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Visibility */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Eye className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-medium">Visibility</h3>
                    </div>

                    <div className="space-y-3">
                      {billboard.viewingDistance && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Viewing Distance
                          </span>
                          <span className="font-medium">
                            {billboard.viewingDistance}m
                          </span>
                        </div>
                      )}
                      {billboard.trafficLevel && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Traffic Level
                          </span>
                          <Badge
                            className={getTrafficColor(billboard.trafficLevel)}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            {billboard.trafficLevel}
                          </Badge>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Operating Hours
                        </span>
                        <span className="font-medium">6:00 AM - 10:00 PM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Billboard Owner</h3>

                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={billboard.owner.avatarUrl || undefined}
                      />
                      <AvatarFallback>
                        {billboard.owner.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{billboard.owner.name}</h4>
                        {billboard.owner.verified && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-50 text-blue-700"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {billboard.owner.businessName && (
                        <p className="text-sm text-muted-foreground">
                          {billboard.owner.businessName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Member since{" "}
                        {format(new Date(billboard.createdAt), "yyyy")}
                      </p>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  {!isOwner && currentUser && billboard.status === "ACTIVE" && (
                    <div className="space-y-3 pt-4 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Inquiry
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Send Inquiry</DialogTitle>
                            <DialogDescription>
                              Send an inquiry to the billboard owner about
                              advertising opportunities.
                            </DialogDescription>
                          </DialogHeader>
                          <form
                            onSubmit={handleInquirySubmit}
                            className="space-y-4"
                          >
                            <div>
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
                                placeholder="Advertising inquiry"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
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
                              <div>
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

                            <div>
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

                            <div className="flex gap-3">
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </DialogTrigger>
                              <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1"
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      {billboard.owner.contactNumber && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            window.open(`tel:${billboard.owner.contactNumber}`)
                          }
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Owner
                        </Button>
                      )}
                    </div>
                  )}

                  {isOwner && (
                    <div className="pt-4 border-t">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          This is your billboard listing. Manage it from your
                          dashboard.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        billboard.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {billboard.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listed</span>
                    <span>
                      {format(new Date(billboard.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inquiries</span>
                    <span>{billboard._count.conversations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billboard ID</span>
                    <span className="font-mono text-xs">
                      {billboard.id.slice(-8)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
