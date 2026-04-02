import api from "./axios";
import type { TravelerProfile, CompanyProfile } from "../types";

export const getTravelerProfile = async (): Promise<TravelerProfile> => {
  const res = await api.get("/traveler");
  return res.data;
};

export const updateTravelerProfile = async (
  data: Partial<TravelerProfile>
): Promise<TravelerProfile> => {
  const res = await api.put("/traveler", data);
  return res.data;
};

export const getCompanyProfile = async (): Promise<CompanyProfile> => {
  const res = await api.get("/company");
  return res.data;
};

export const updateCompanyProfile = async (
  data: Partial<CompanyProfile>
): Promise<CompanyProfile> => {
  const res = await api.put("/company", data);
  return res.data;
};

export const requestVerification = async (): Promise<{ message: string }> => {
  const res = await api.post("/company/request-verification");
  return res.data;
};
