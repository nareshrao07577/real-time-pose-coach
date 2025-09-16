import { useState, useEffect } from "react";
import ExerciseCard from "./ExerciseCard";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import exercisesData from "@/data/exercises.json";

interface Exercise {
  id: string;
  title: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  image: string;
  category: string;
  instructions?: string;
  tags?: string[];
  pose_template?: {
    key_angles: Record<string, { min: number; max: number }>;
    keypoints: string[];
  };
}

interface ExerciseLibraryProps {
  onStartExercise: (exercise: Exercise) => void;
}

const ExerciseLibrary = ({ onStartExercise }: ExerciseLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Load exercises from JSON data
  useEffect(() => {
    setExercises(exercisesData as Exercise[]);
  }, []);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === "All" || exercise.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(exercises.map(ex => ex.category)))];

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
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search exercises by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 backdrop-blur-sm border-border/50"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Difficulty Filter */}
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground self-center min-w-fit">Difficulty:</span>
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

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground self-center min-w-fit">Category:</span>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
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
              category={exercise.category}
              tags={exercise.tags || []}
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