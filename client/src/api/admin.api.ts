import api from "./axios";

export interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  totalBookings: number;
  totalCompanies: number;
  verifiedCompanies: number;
  pendingCompanies: number;
  totalRevenue: number;
  monthlyTrend: { _id: { year: number; month: number }; count: number; revenue: number }[];
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const getAllUsers = async (params?: { role?: string; page?: number }) => {
  const res = await api.get("/admin/users", { params });
  return res.data;
};

export const toggleUserActive = async (id: string) => {
  const res = await api.patch(`/admin/users/${id}/toggle`);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const getAllCompanies = async (status?: string) => {
  const res = await api.get("/admin/companies", { params: { status } });
  return res.data;
};

export const getPendingCompanies = async () => {
  const res = await api.get("/admin/companies/pending");
  return res.data;
};

export const approveCompany = async (id: string, message?: string) => {
  const res = await api.patch(`/admin/companies/${id}/approve`, { message });
  return res.data;
};

export const rejectCompany = async (id: string, message: string) => {
  const res = await api.patch(`/admin/companies/${id}/reject`, { message });
  return res.data;
};

export const getRecentBookings = async () => {
  const res = await api.get("/admin/bookings/recent");
  return res.data;
};
