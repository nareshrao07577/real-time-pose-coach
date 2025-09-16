import { Button } from "@/components/ui/button";
import { Play, Target, Zap } from "lucide-react";
import heroImage from "@/assets/hero-fitness.jpg";

interface HeroSectionProps {
  onStartWorkout?: () => void;
  onViewExercises?: () => void;
}

const HeroSection = ({ onStartWorkout, onViewExercises }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="AI Fitness Training with Motion Detection" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/20 animate-float" />
      <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-secondary/20 animate-bounce-subtle" />
      <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-primary-glow/30 animate-pulse-glow" />

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl px-6">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-medium backdrop-blur-sm">
            <Zap className="w-4 h-4" />
            AI-Powered Fitness
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary-glow to-secondary bg-clip-text text-transparent leading-tight">
          Motion<span className="text-primary">X</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Transform your fitness journey with real-time AI pose detection. 
          Get instant feedback, perfect your form, and achieve your goals faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            variant="hero" 
            size="xl" 
            className="group"
            onClick={onStartWorkout}
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start Workout
          </Button>
          <Button 
            variant="outline" 
            size="xl"
            onClick={onViewExercises}
          >
            <Target className="w-5 h-5" />
            View Exercises
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-muted-foreground">Pose Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
            <div className="text-muted-foreground">Feedback</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">AI-Powered</div>
            <div className="text-muted-foreground">Form Correction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;