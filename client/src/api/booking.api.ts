import api from "./axios";
import type { Booking } from "../types";

export const createBooking = async (data: {
  tripId: string;
  seatsBooked: number;
}): Promise<Booking> => {
  const res = await api.post("/bookings", data);
  return res.data.booking;
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const res = await api.get("/bookings/my");
  return res.data;
};

export const cancelBooking = async (id: string): Promise<void> => {
  await api.put(`/bookings/cancel/${id}`);
};

export const getCompanyBookings = async (): Promise<Booking[]> => {
  const res = await api.get("/bookings/company");
  return res.data;
};
