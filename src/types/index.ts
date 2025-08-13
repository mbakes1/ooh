// Import Prisma types
import type {
  User as PrismaUser,
  Billboard as PrismaBillboard,
  BillboardImage as PrismaBillboardImage,
  Conversation as PrismaConversation,
  Message as PrismaMessage,
  PasswordResetToken as PrismaPasswordResetToken,
  UserRole,
  BillboardStatus,
  TrafficLevel,
} from "@prisma/client";

// Re-export Prisma types for consistency
export type User = PrismaUser;
export type Billboard = PrismaBillboard;
export type BillboardImage = PrismaBillboardImage;
export type Conversation = PrismaConversation;
export type Message = PrismaMessage;
export type PasswordResetToken = PrismaPasswordResetToken;

export type { UserRole, BillboardStatus, TrafficLevel };

// Extended types with relations
export type UserWithProfile = User & {
  profile?: {
    businessName?: string;
    contactNumber?: string;
    location?: string;
    verified: boolean;
    avatarUrl?: string;
  };
  _count?: {
    billboards: number;
    sentMessages: number;
    receivedMessages: number;
  };
  suspended?: boolean;
  suspendedAt?: Date;
};

export type BillboardWithDetails = Billboard & {
  owner: User;
  images: BillboardImage[];
};

export type BillboardWithImages = Billboard & {
  images: BillboardImage[];
};

export type ConversationWithMessages = Conversation & {
  messages: Message[];
  participants: User[];
  billboard?: Billboard;
};

export type MessageWithSender = Message & {
  sender: User;
  recipient: User;
};

// Additional utility types
export interface BillboardLocation {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface BillboardSpecs {
  width: number;
  height: number;
  resolution: string;
  brightness: number;
  viewingDistance: number;
  traffic: "HIGH" | "MEDIUM" | "LOW";
}

export interface BillboardPricing {
  basePrice: number;
  currency: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY";
}

export interface BillboardAvailability {
  startDate: Date;
  endDate: Date;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// Search and filter types
export interface BillboardSearchFilters {
  location?: string;
  city?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  trafficLevel?: TrafficLevel;
  status?: BillboardStatus;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Re-export UI types for convenience
export * from "./ui";
