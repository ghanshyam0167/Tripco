export type Role = "TRAVELER" | "COMPANY" | "ADMIN";

export interface User {
  _id: string;
  name?: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface Destination {
  city?: string;
  state?: string;
  country?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Trip {
  _id: string;
  title: string;
  description?: string;
  destination: Destination;
  duration: { days: number; nights?: number };
  startDate?: string;
  endDate?: string;
  price: number;
  discountPrice?: number;
  totalSeats: number;
  availableSeats: number;
  itinerary?: ItineraryDay[];
  tags?: string[];
  travelStyle?: "budget" | "luxury" | "backpacking" | "family";
  images?: string[];
  rating?: number;
  totalReviews?: number;
  status?: "active" | "inactive" | "completed";
  companyId?: { email: string };
  companyProfileId?: { companyName: string };
  createdAt?: string;
}

export interface Booking {
  _id: string;
  userId: string | { email: string };
  tripId: Trip | string;
  seatsBooked: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt?: string;
}

export interface TravelerProfile {
  _id: string;
  userId: string;
  fullName: string;
  phone?: string;
  age?: number;
  gender?: string;
  location?: Destination;
  profileImage?: string;
  bio?: string;
  preferences?: {
    budget?: number;
    interests?: string[];
    travelStyle?: string;
    preferredDestinations?: string[];
    travelFrequency?: string;
  };
  wishlist?: string[];
  bookings?: string[];
  isProfileComplete?: boolean;
}

export interface CompanyProfile {
  _id: string;
  userId: string;
  companyName: string;
  companyLogo?: string;
  description?: string;
  location?: Destination;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  registrationNumber?: string;
  establishedYear?: number;
  isVerified?: boolean;
  verificationStatus?: "pending" | "approved" | "rejected";
  rating?: number;
  totalReviews?: number;
  totalTrips?: number;
  totalBookings?: number;
  servicesOffered?: string[];
  priceRange?: { min?: number; max?: number };
}