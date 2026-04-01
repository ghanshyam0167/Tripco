import api from "./axios";
import type { Trip } from "../types";

export const getAllTrips = async (): Promise<Trip[]> => {
  const res = await api.get("/trips");
  return res.data;
};

export const getTripById = async (id: string): Promise<Trip> => {
  const res = await api.get(`/trips/${id}`);
  return res.data;
};

export const searchTrips = async (params: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  travelStyle?: string;
}): Promise<Trip[]> => {
  const res = await api.get("/trips/search", { params });
  return res.data;
};

export const createTrip = async (data: Partial<Trip>): Promise<Trip> => {
  const res = await api.post("/trips", data);
  return res.data.trip;
};

export const updateTrip = async (id: string, data: Partial<Trip>): Promise<Trip> => {
  const res = await api.put(`/trips/${id}`, data);
  return res.data.trip;
};

export const deleteTrip = async (id: string): Promise<void> => {
  await api.delete(`/trips/${id}`);
};
