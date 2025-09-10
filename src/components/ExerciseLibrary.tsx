import { useState } from "react";
import ExerciseCard from "./ExerciseCard";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Exercise {
  id: string;
  title: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  image: string;
  category: string;
}

interface ExerciseLibraryProps {
  onStartExercise: (exercise: Exercise) => void;
}

const ExerciseLibrary = ({ onStartExercise }: ExerciseLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  const exercises: Exercise[] = [
    {
      id: "1",
      title: "Push-ups",
      duration: "5 min",
      difficulty: "Beginner",
      description: "Perfect your push-up form with real-time AI feedback on arm position and body alignment.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      category: "Upper Body"
    },
    {
      id: "2", 
      title: "Squats",
      duration: "8 min",
      difficulty: "Beginner",
      description: "Master proper squat technique with AI monitoring of knee alignment and depth.",
      image: "https://images.unsplash.com/photo-1566241134043-de03b9eb9041?w=400&h=300&fit=crop",
      category: "Lower Body"
    },
    {
      id: "3",
      title: "Planks",
      duration: "10 min",
      difficulty: "Intermediate",
      description: "Hold perfect plank position with AI guidance on core engagement and spine alignment.",
      image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&fit=crop",
      category: "Core"
    },
    {
      id: "4",
      title: "Deadlifts", 
      duration: "12 min",
      difficulty: "Advanced",
      description: "Execute proper deadlift form with AI analysis of hip hinge movement and back position.",
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop",
      category: "Full Body"
    },
    {
      id: "5",
      title: "Lunges",
      duration: "6 min", 
      difficulty: "Intermediate",
      description: "Improve balance and form with AI feedback on lunge depth and knee tracking.",
      image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop",
      category: "Lower Body"
    },
    {
      id: "6",
      title: "Mountain Climbers",
      duration: "4 min",
      difficulty: "Advanced", 
      description: "Maintain proper form during high-intensity movement with real-time pose analysis.",
      image: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=300&fit=crop",
      category: "Cardio"
    }
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All" || exercise.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Exercise Library
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our collection of AI-powered exercises designed to perfect your form
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 backdrop-blur-sm border-border/50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedDifficulty === "All" ? "default" : "outline"}
              onClick={() => setSelectedDifficulty("All")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedDifficulty === "Beginner" ? "default" : "outline"}
              onClick={() => setSelectedDifficulty("Beginner")}
              size="sm"
            >
              Beginner
            </Button>
            <Button
              variant={selectedDifficulty === "Intermediate" ? "default" : "outline"}
              onClick={() => setSelectedDifficulty("Intermediate")}
              size="sm"
            >
              Intermediate
            </Button>
            <Button
              variant={selectedDifficulty === "Advanced" ? "default" : "outline"}
              onClick={() => setSelectedDifficulty("Advanced")}
              size="sm"
            >
              Advanced
            </Button>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              title={exercise.title}
              duration={exercise.duration}
              difficulty={exercise.difficulty}
              description={exercise.description}
              image={exercise.image}
              onStart={() => onStartExercise(exercise)}
            />
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No exercises found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExerciseLibrary;