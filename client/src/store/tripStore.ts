import { create } from "zustand";
import type { Trip } from "../types";
import { getAllTrips, searchTrips as searchTripsApi } from "../api/trip.api";

interface TripState {
  trips: Trip[];
  selectedTrip: Trip | null;
  loading: boolean;
  error: string | null;
  fetchTrips: () => Promise<void>;
  searchTrips: (params: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    travelStyle?: string;
  }) => Promise<void>;
  setSelectedTrip: (trip: Trip | null) => void;
  removeTrip: (id: string) => void;
  addTrip: (trip: Trip) => void;
  updateTripInList: (trip: Trip) => void;
}

export const useTripStore = create<TripState>((set) => ({
  trips: [],
  selectedTrip: null,
  loading: false,
  error: null,

  fetchTrips: async () => {
    set({ loading: true, error: null });
    try {
      const trips = await getAllTrips();
      set({ trips, loading: false });
    } catch {
      set({ error: "Failed to load trips", loading: false });
    }
  },

  searchTrips: async (params) => {
    set({ loading: true, error: null });
    try {
      const trips = await searchTripsApi(params);
      set({ trips, loading: false });
    } catch {
      set({ error: "Search failed", loading: false });
    }
  },

  setSelectedTrip: (trip) => set({ selectedTrip: trip }),

  removeTrip: (id) =>
    set((state) => ({ trips: state.trips.filter((t) => t._id !== id) })),

  addTrip: (trip) =>
    set((state) => ({ trips: [trip, ...state.trips] })),

  updateTripInList: (trip) =>
    set((state) => ({
      trips: state.trips.map((t) => (t._id === trip._id ? trip : t)),
    })),
}));
