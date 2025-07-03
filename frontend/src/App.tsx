
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SupervisorDashboardShell from "./pages/supervisor/SupervisorDashboardShell";
import SignIn from "./pages/SignIn";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import StudentDashboardShell from "./pages/student/StudentDashboardShell";
import DashboardShell from "./pages/DashboardShell";
import DeanDashboardShell from "./pages/dean/DeanDashboardShell";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<SignIn />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<DashboardShell />} />
          <Route path="/supervisor" element={<SupervisorDashboardShell />} />
          <Route path="/student" element={<StudentDashboardShell />} />
          <Route path="/dean" element={<DeanDashboardShell />} />

          
          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
