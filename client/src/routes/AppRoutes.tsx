import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";

// Auth
import Login          from "../pages/auth/Login";
import Register       from "../pages/auth/Register";
import VerifyEmail    from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Traveler
import TravelerDashboard from "../pages/traveler/Dashboard";
import ExploreTrips      from "../pages/traveler/ExploreTrips";
import TripDetail        from "../pages/traveler/TripDetail";
import MyBookings        from "../pages/traveler/MyBookings";

// Company
import CompanyDashboard  from "../pages/company/Dashboard";
import CreateTrip        from "../pages/company/CreateTrip";
import ManageTrips       from "../pages/company/ManageTrips";
import CompanyBookings   from "../pages/company/Bookings";

// Admin
import AdminDashboard    from "../pages/admin/Dashboard";
import AdminUsers        from "../pages/admin/Users";
import AdminPendingRequests from "../pages/admin/PendingRequests";

// Misc
import NotFound          from "../pages/NotFound";
import Unauthorized      from "../pages/Unauthorized";

// Guards
import ProtectedRoute    from "./ProtectedRoute";
import RoleRoute         from "./RoleRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "var(--radius-md)",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "var(--shadow-lg)",
            paddingRight: 4,
          },
          success: { duration: 3000 },
          error:   { duration: 4000 },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    margin: 0,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  title="Click to dismiss"
                >
                  {icon}
                </button>
                {message}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>

      <Routes>
        {/* Public */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/verify-email"    element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ─── Traveler ────────────────────────────────────────── */}
        <Route
          path="/traveler"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["TRAVELER"]}>
                <TravelerDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/traveler/trips"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["TRAVELER"]}>
                <ExploreTrips />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/traveler/trips/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["TRAVELER"]}>
                <TripDetail />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/traveler/bookings"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["TRAVELER"]}>
                <MyBookings />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ─── Company ─────────────────────────────────────────── */}
        <Route
          path="/company"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["COMPANY"]}>
                <CompanyDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/create"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["COMPANY"]}>
                <CreateTrip />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/trips"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["COMPANY"]}>
                <ManageTrips />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/bookings"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["COMPANY"]}>
                <CompanyBookings />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ─── Admin ───────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <AdminPendingRequests />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Misc */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*"             element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;