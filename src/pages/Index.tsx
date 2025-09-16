import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import ExerciseLibrary from "@/components/ExerciseLibrary";
import PoseDetection from "@/components/PoseDetection";
import Dashboard from "@/components/Dashboard";
import Leaderboard from "@/components/Leaderboard";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, LogIn } from "lucide-react";

interface Exercise {
  id: string;
  title: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  image: string;
  category: string;
  tags: string[];
}

type View = "home" | "exercises" | "workout" | "dashboard" | "leaderboard" | "profile" | "settings";

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentView("workout");
  };

  const handleCompleteWorkout = () => {
    setCurrentView("exercises");
    setSelectedExercise(null);
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedExercise(null);
  };

  // Render workout view
  if (currentView === "workout" && selectedExercise) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView("exercises")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Exercises
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedExercise.title}</h1>
              <p className="text-muted-foreground">AI-Powered Form Analysis</p>
            </div>
          </div>

          <PoseDetection 
            exerciseName={selectedExercise.title}
            exerciseCategory={selectedExercise.category}
            exerciseTags={selectedExercise.tags || []}
            onComplete={handleCompleteWorkout}
          />
        </div>
      </div>
    );
  }

  // Render dashboard view
  if (currentView === "dashboard") {
    return (
      <>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <Dashboard />
      </>
    );
  }

  // Render leaderboard view
  if (currentView === "leaderboard") {
    return (
      <>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <Leaderboard />
      </>
    );
  }

  // Render exercises view
  if (currentView === "exercises") {
    return (
      <>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <div className="container mx-auto px-6">
          <ExerciseLibrary onStartExercise={handleStartExercise} />
        </div>
      </>
    );
  }

  // Render profile/settings views (placeholder)
  if (currentView === "profile" || currentView === "settings") {
    return (
      <>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold mb-4 capitalize">{currentView}</h1>
              <p className="text-muted-foreground mb-8">
                {currentView === "profile" 
                  ? "Manage your profile and workout preferences" 
                  : "Adjust your app settings and preferences"
                }
              </p>
              <Button 
                onClick={() => setCurrentView("dashboard")}
                className="flex items-center gap-2 mx-auto"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render home view
  return (
    <div className="min-h-screen bg-background">
      {user ? (
        <>
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
          <HeroSection 
            onStartWorkout={() => setCurrentView("exercises")}
            onViewExercises={() => setCurrentView("exercises")}
          />
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => setCurrentView("exercises")}
              className="shadow-elegant animate-bounce-subtle"
            >
              Start Training
            </Button>
          </div>
        </>
      ) : (
        <>
          <HeroSection 
            onStartWorkout={() => window.location.href = "/auth"}
            onViewExercises={() => window.location.href = "/auth"}
          />
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => window.location.href = "/auth"}
              className="shadow-elegant animate-bounce-subtle flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Get Started
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
