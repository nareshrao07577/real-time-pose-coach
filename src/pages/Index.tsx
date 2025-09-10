import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import ExerciseLibrary from "@/components/ExerciseLibrary";
import PoseDetection from "@/components/PoseDetection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Exercise {
  id: string;
  title: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  image: string;
  category: string;
}

type View = "home" | "exercises" | "workout";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

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
            onComplete={handleCompleteWorkout}
          />
        </div>
      </div>
    );
  }

  if (currentView === "exercises") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto">
          <div className="flex items-center justify-between px-6 py-8">
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
          <ExerciseLibrary onStartExercise={handleStartExercise} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <Button 
          variant="hero" 
          size="lg"
          onClick={() => setCurrentView("exercises")}
          className="shadow-elegant animate-bounce-subtle"
        >
          Explore Exercises
        </Button>
      </div>
    </div>
  );
};

export default Index;
