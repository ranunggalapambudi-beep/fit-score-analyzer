import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Athletes from "./pages/Athletes";
import AthleteDetail from "./pages/AthleteDetail";
import AthleteDashboard from "./pages/AthleteDashboard";
import Tests from "./pages/Tests";
import TestCategory from "./pages/TestCategory";
import TestSession from "./pages/TestSession";
import Results from "./pages/Results";
import Analysis from "./pages/Analysis";
import SessionComparison from "./pages/SessionComparison";
import CoachDashboard from "./pages/CoachDashboard";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import TeamComparison from "./pages/TeamComparison";
import Tutorial from "./pages/Tutorial";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Protected routes */}
              <Route path="/athletes" element={
                <ProtectedRoute><Athletes /></ProtectedRoute>
              } />
              <Route path="/athletes/:id" element={
                <ProtectedRoute><AthleteDetail /></ProtectedRoute>
              } />
              <Route path="/athletes/:athleteId/dashboard" element={
                <ProtectedRoute><AthleteDashboard /></ProtectedRoute>
              } />
              <Route path="/tests" element={
                <ProtectedRoute><Tests /></ProtectedRoute>
              } />
              <Route path="/tests/:categoryId" element={
                <ProtectedRoute><TestCategory /></ProtectedRoute>
              } />
              <Route path="/test-session/:athleteId" element={
                <ProtectedRoute><TestSession /></ProtectedRoute>
              } />
              <Route path="/results" element={
                <ProtectedRoute><Results /></ProtectedRoute>
              } />
              <Route path="/analysis" element={
                <ProtectedRoute><Analysis /></ProtectedRoute>
              } />
              <Route path="/analysis/:athleteId" element={
                <ProtectedRoute><Analysis /></ProtectedRoute>
              } />
              <Route path="/comparison/:athleteId" element={
                <ProtectedRoute><SessionComparison /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><CoachDashboard /></ProtectedRoute>
              } />
              <Route path="/teams" element={
                <ProtectedRoute><Teams /></ProtectedRoute>
              } />
              <Route path="/teams/:id" element={
                <ProtectedRoute><TeamDetail /></ProtectedRoute>
              } />
              <Route path="/teams/:teamId/comparison" element={
                <ProtectedRoute><TeamComparison /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
