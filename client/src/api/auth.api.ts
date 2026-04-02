import api from "./axios";
import type { AuthResponse } from "../types";

export const login = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const register = async (data: {
  email: string;
  password: string;
  role: "TRAVELER" | "COMPANY";
}): Promise<{ message: string; userId: string; email: string }> => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const verifyEmail = async (data: {
  userId: string;
  otp: string;
}): Promise<AuthResponse> => {
  const res = await api.post("/auth/verify-email", data);
  return res.data;
};

export const resendOTP = async (data: { userId: string }): Promise<{ message: string }> => {
  const res = await api.post("/auth/resend-otp", data);
  return res.data;
};