import { create } from "zustand";
import type { Booking } from "../types";
import {
  getMyBookings,
  getCompanyBookings,
  cancelBooking as cancelBookingApi,
} from "../api/booking.api";

interface BookingState {
  myBookings: Booking[];
  companyBookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchMyBookings: () => Promise<void>;
  fetchCompanyBookings: () => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  myBookings: [],
  companyBookings: [],
  loading: false,
  error: null,

  fetchMyBookings: async () => {
    set({ loading: true, error: null });
    try {
      const myBookings = await getMyBookings();
      set({ myBookings, loading: false });
    } catch {
      set({ error: "Failed to load bookings", loading: false });
    }
  },

  fetchCompanyBookings: async () => {
    set({ loading: true, error: null });
    try {
      const companyBookings = await getCompanyBookings();
      set({ companyBookings, loading: false });
    } catch {
      set({ error: "Failed to load bookings", loading: false });
    }
  },

  cancelBooking: async (id: string) => {
    await cancelBookingApi(id);
    const updatedBookings = get().myBookings.map((b) =>
      b._id === id ? { ...b, status: "cancelled" as const } : b
    );
    set({ myBookings: updatedBookings });
  },
}));
