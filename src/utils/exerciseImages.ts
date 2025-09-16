// Import all exercise images
import pushups from "@/assets/exercises/pushups.jpg";
import squats from "@/assets/exercises/squats.jpg";
import planks from "@/assets/exercises/planks.jpg";
import deadlifts from "@/assets/exercises/deadlifts.jpg";
import lunges from "@/assets/exercises/lunges.jpg";
import mountainClimbers from "@/assets/exercises/mountain-climbers.jpg";
import burpees from "@/assets/exercises/burpees.jpg";
import jumpingJacks from "@/assets/exercises/jumping-jacks.jpg";
import bicepCurls from "@/assets/exercises/bicep-curls.jpg";
import tricepDips from "@/assets/exercises/tricep-dips.jpg";
import shoulderPress from "@/assets/exercises/shoulder-press.jpg";
import russianTwists from "@/assets/exercises/russian-twists.jpg";
import legRaises from "@/assets/exercises/leg-raises.jpg";
import wallSit from "@/assets/exercises/wall-sit.jpg";
import calfRaises from "@/assets/exercises/calf-raises.jpg";

// Exercise image mapping
export const exerciseImages: Record<string, string> = {
  "push-ups": pushups,
  "pushups": pushups,
  "squats": squats,
  "planks": planks,
  "plank": planks,
  "deadlifts": deadlifts,
  "deadlift": deadlifts,
  "lunges": lunges,
  "lunge": lunges,
  "mountain-climbers": mountainClimbers,
  "mountain climbers": mountainClimbers,
  "burpees": burpees,
  "burpee": burpees,
  "jumping-jacks": jumpingJacks,
  "jumping jacks": jumpingJacks,
  "bicep-curls": bicepCurls,
  "bicep curls": bicepCurls,
  "tricep-dips": tricepDips,
  "tricep dips": tricepDips,
  "shoulder-press": shoulderPress,
  "shoulder press": shoulderPress,
  "russian-twists": russianTwists,
  "russian twists": russianTwists,
  "leg-raises": legRaises,
  "leg raises": legRaises,
  "wall-sit": wallSit,
  "wall sit": wallSit,
  "calf-raises": calfRaises,
  "calf raises": calfRaises,
};

/**
 * Get exercise image by title or fallback to a default image
 */
export const getExerciseImage = (title: string): string => {
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, '-');
  return exerciseImages[normalizedTitle] || exerciseImages[title.toLowerCase()] || pushups;
};