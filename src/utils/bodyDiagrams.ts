// Import body diagram images
import chestDiagram from "@/assets/body-diagrams/chest.png";
import legsDiagram from "@/assets/body-diagrams/legs.png";
import coreDiagram from "@/assets/body-diagrams/core.png";
import armsDiagram from "@/assets/body-diagrams/arms.png";
import backDiagram from "@/assets/body-diagrams/back.png";
import glutesDiagram from "@/assets/body-diagrams/glutes.png";
import shouldersDiagram from "@/assets/body-diagrams/shoulders.png";
import fullBodyDiagram from "@/assets/body-diagrams/full-body.png";

// Mapping of exercise tags/categories to body diagrams
const tagToDiagramMap: Record<string, string> = {
  // Chest exercises
  chest: chestDiagram,
  push: chestDiagram,
  
  // Leg exercises
  legs: legsDiagram,
  quads: legsDiagram,
  hamstrings: legsDiagram,
  calves: legsDiagram,
  thighs: legsDiagram,
  
  // Core exercises
  core: coreDiagram,
  abs: coreDiagram,
  obliques: coreDiagram,
  
  // Arm exercises
  arms: armsDiagram,
  biceps: armsDiagram,
  triceps: armsDiagram,
  
  // Back exercises
  back: backDiagram,
  lats: backDiagram,
  
  // Glute exercises
  glutes: glutesDiagram,
  
  // Shoulder exercises
  shoulders: shouldersDiagram,
  delts: shouldersDiagram,
  deltoids: shouldersDiagram,
};

const categoryToDiagramMap: Record<string, string> = {
  "Upper Body": armsDiagram,
  "Lower Body": legsDiagram,
  "Core": coreDiagram,
  "Full Body": fullBodyDiagram,
  "Cardio": fullBodyDiagram,
  "Strength": fullBodyDiagram,
  "Flexibility": fullBodyDiagram,
};

/**
 * Get the appropriate body diagram for an exercise based on its tags and category
 */
export const getBodyDiagram = (tags: string[], category: string): string => {
  // First, try to find a matching tag
  for (const tag of tags) {
    const diagram = tagToDiagramMap[tag.toLowerCase()];
    if (diagram) {
      return diagram;
    }
  }
  
  // If no tag matches, use the category
  const categoryDiagram = categoryToDiagramMap[category];
  if (categoryDiagram) {
    return categoryDiagram;
  }
  
  // Default fallback
  return fullBodyDiagram;
};

/**
 * Get a list of muscle groups targeted by an exercise
 */
export const getTargetedMuscles = (tags: string[], category: string): string[] => {
  const muscleGroups: string[] = [];
  
  // Add muscle groups based on tags
  tags.forEach(tag => {
    switch (tag.toLowerCase()) {
      case 'chest':
        muscleGroups.push('Chest');
        break;
      case 'arms':
      case 'biceps':
      case 'triceps':
        muscleGroups.push('Arms');
        break;
      case 'shoulders':
      case 'delts':
      case 'deltoids':
        muscleGroups.push('Shoulders');
        break;
      case 'back':
      case 'lats':
        muscleGroups.push('Back');
        break;
      case 'core':
      case 'abs':
      case 'obliques':
        muscleGroups.push('Core');
        break;
      case 'legs':
      case 'quads':
      case 'hamstrings':
      case 'calves':
      case 'thighs':
        muscleGroups.push('Legs');
        break;
      case 'glutes':
        muscleGroups.push('Glutes');
        break;
    }
  });
  
  // Remove duplicates
  return [...new Set(muscleGroups)];
};