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
  nightActivity?: {
    isIncluded: boolean;
    title: string;
    description: string;
  };
}

export interface Supervisor {
  name: string;
  phone: string;
  email: string;
  role: string;
  experience: number;
  idProof?: string;
}

export interface TransportDetails {
  modeType: "same" | "multiple";
  sameVehicle?: {
    from: string;
    to: string;
    vehicleType: "Bus" | "Train" | "Flight" | "Car" | string;
    busType?: string;
    busNumber?: string;
    trainNumber?: string;
    coachType?: string;
    flightNumber?: string;
    flightClass?: string;
    carType?: string;
    acNonAc?: string;
  };
  multipleVehicles?: Array<{
    day: number;
    from: string;
    to: string;
    vehicleType: "Bus" | "Train" | "Flight" | "Car" | "Other" | string;
    busType?: string;
    busNumber?: string;
    trainNumber?: string;
    coachType?: string;
    flightNumber?: string;
    flightClass?: string;
    carType?: string;
    acNonAc?: string;
    details?: string;
  }>;
}

export interface StayDetails {
  day?: number;
  hotelName: string;
  location: string;
  roomType: "Single" | "Double" | "Deluxe" | "Suite" | string;
  mealPlan: "Room Only" | "Breakfast" | "Half Board" | "Full Board" | string;
  amenities: string[];
  checkIn?: string;
  checkOut?: string;
}

export interface Trip {
  _id: string;
  title: string;
  description?: string;
  origin?: { location: string };
  destination: Destination;
  transport?: TransportDetails;
  stay?: {
    type: "same" | "perDay";
    details: StayDetails[];
  };
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
  supervisors?: Supervisor[];
  rating?: number;
  totalReviews?: number;
  status?: "active" | "inactive" | "draft" | "completed";
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
  userId: string | { email: string; isActive?: boolean };
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
  verificationStatus?: "unverified" | "pending" | "approved" | "rejected";
  verificationMessage?: string;
  verificationHistory?: {
    status: "pending" | "approved" | "rejected";
    reason?: string;
    updatedAt: string;
    updatedBy?: { email: string };
  }[];
  rating?: number;
  totalReviews?: number;
  totalTrips?: number;
  totalBookings?: number;
  servicesOffered?: string[];
  priceRange?: { min?: number; max?: number };
  createdAt?: string;
  updatedAt?: string;
}