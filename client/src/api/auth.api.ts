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
}): Promise<AuthResponse> => {
  const res = await api.post("/auth/register", data);
  return res.data;
};