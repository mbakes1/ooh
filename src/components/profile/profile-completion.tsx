"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";

interface User {
  name: string;
  email: string;
  role: "OWNER" | "ADVERTISER";
  businessName?: string | null;
  contactNumber?: string | null;
  location?: string | null;
  verified: boolean;
  avatarUrl?: string | null;
}

interface ProfileCompletionProps {
  user: User;
}

export function ProfileCompletion({ user }: ProfileCompletionProps) {
  const getCompletionItems = () => {
    const baseItems = [
      {
        label: "Basic Information",
        completed: !!(user.name && user.email),
        description: "Name and email address",
      },
      {
        label: "Contact Details",
        completed: !!user.contactNumber,
        description: "Phone number",
      },
      {
        label: "Location",
        completed: !!user.location,
        description: "Your location",
      },
      {
        label: "Profile Picture",
        completed: !!user.avatarUrl,
        description: "Upload your avatar",
      },
      {
        label: "Account Verification",
        completed: user.verified,
        description: "Verify your account",
      },
    ];

    // Add business name requirement for owners
    if (user.role === "OWNER") {
      baseItems.splice(1, 0, {
        label: "Business Information",
        completed: !!user.businessName,
        description: "Business name",
      });
    }

    return baseItems;
  };

  const completionItems = getCompletionItems();
  const completedCount = completionItems.filter(
    (item) => item.completed
  ).length;
  const totalCount = completionItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Profile Completion
          <span className="text-sm font-normal text-gray-600">
            {completedCount}/{totalCount} completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="space-y-3">
          {completionItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              {item.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
