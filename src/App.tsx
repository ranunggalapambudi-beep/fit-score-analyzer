import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Athletes from "./pages/Athletes";
import AthleteDetail from "./pages/AthleteDetail";
import Tests from "./pages/Tests";
import TestCategory from "./pages/TestCategory";
import TestSession from "./pages/TestSession";
import Results from "./pages/Results";
import Analysis from "./pages/Analysis";
import SessionComparison from "./pages/SessionComparison";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/athletes" element={<Athletes />} />
          <Route path="/athletes/:id" element={<AthleteDetail />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/tests/:categoryId" element={<TestCategory />} />
          <Route path="/test-session/:athleteId" element={<TestSession />} />
          <Route path="/results" element={<Results />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/analysis/:athleteId" element={<Analysis />} />
          <Route path="/comparison/:athleteId" element={<SessionComparison />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
