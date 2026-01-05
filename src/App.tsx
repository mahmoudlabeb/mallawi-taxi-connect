import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Passenger pages
import PassengerDashboard from "./pages/passenger/PassengerDashboard";
import BookRide from "./pages/passenger/BookRide";
import RideHistory from "./pages/passenger/RideHistory";
import PassengerProfile from "./pages/passenger/PassengerProfile";

// Driver pages
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverRides from "./pages/driver/DriverRides";
import DriverHistory from "./pages/driver/DriverHistory";
import DriverProfile from "./pages/driver/DriverProfile";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminPassengers from "./pages/admin/AdminPassengers";
import AdminRides from "./pages/admin/AdminRides";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Passenger Routes */}
            <Route
              path="/passenger"
              element={
                <ProtectedRoute allowedRoles={["passenger"]}>
                  <PassengerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/passenger/book"
              element={
                <ProtectedRoute allowedRoles={["passenger"]}>
                  <BookRide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/passenger/history"
              element={
                <ProtectedRoute allowedRoles={["passenger"]}>
                  <RideHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/passenger/profile"
              element={
                <ProtectedRoute allowedRoles={["passenger"]}>
                  <PassengerProfile />
                </ProtectedRoute>
              }
            />

            {/* Driver Routes */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={["driver"]}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/rides"
              element={
                <ProtectedRoute allowedRoles={["driver"]}>
                  <DriverRides />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/history"
              element={
                <ProtectedRoute allowedRoles={["driver"]}>
                  <DriverHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/profile"
              element={
                <ProtectedRoute allowedRoles={["driver"]}>
                  <DriverProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/drivers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDrivers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/passengers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPassengers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rides"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminRides />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
