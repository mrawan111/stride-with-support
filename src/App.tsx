import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ColorBlindModeProvider } from "@/contexts/ColorBlindModeContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ExerciseList from "./pages/ExerciseList";
import ExerciseDetail from "./pages/ExerciseDetail";
import Profile from "./pages/Profile";
import AdminExercises from "./pages/AdminExercises";
import AdminExerciseForm from "./pages/AdminExerciseForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <ColorBlindModeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/exercises/:category" element={<ExerciseList />} />
                <Route path="/exercise/:id" element={<ExerciseDetail />} />
                <Route path="/admin/exercises" element={<AdminExercises />} />
                <Route path="/admin/exercises/new" element={<AdminExerciseForm />} />
                <Route path="/admin/exercises/:id" element={<AdminExerciseForm />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ColorBlindModeProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
