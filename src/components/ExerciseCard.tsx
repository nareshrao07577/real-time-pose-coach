import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Target, Trophy, User } from "lucide-react";
import { getBodyDiagram, getTargetedMuscles } from "@/utils/bodyDiagrams";

interface ExerciseCardProps {
  title: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  image: string;
  category: string;
  tags: string[];
  onStart: () => void;
}

const ExerciseCard = ({ title, duration, difficulty, description, image, category, tags, onStart }: ExerciseCardProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Beginner": return "text-success";
      case "Intermediate": return "text-primary";
      case "Advanced": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const bodyDiagram = getBodyDiagram(tags, category);
  const targetedMuscles = getTargetedMuscles(tags, category);

  return (
    <Card className="group overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-smooth hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-smooth">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
          {description}
        </p>

        {/* Body Diagram and Targeted Muscles */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <img
              src={bodyDiagram}
              alt={`Body diagram showing targeted muscles`}
              className="w-16 h-20 object-contain bg-background/50 rounded border border-border/50"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Targeted Muscles</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {targetedMuscles.map((muscle, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            Pose Detection
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            AI Feedback
          </div>
        </div>

        <Button 
          variant="workout" 
          className="w-full" 
          onClick={onStart}
        >
          Start Exercise
        </Button>
      </div>
    </Card>
  );
};

export default ExerciseCard;