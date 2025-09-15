export const importExercises = async () => {
  try {
    const response = await fetch('/src/data/exercises.json');
    const exercises = await response.json();
    return exercises;
  } catch (error) {
    console.error('Error loading exercises:', error);
    return [];
  }
};

export const searchExercises = (exercises: any[], searchTerm: string) => {
  if (!searchTerm) return exercises;
  
  const lowercaseSearch = searchTerm.toLowerCase();
  return exercises.filter(exercise => 
    exercise.title.toLowerCase().includes(lowercaseSearch) ||
    exercise.description.toLowerCase().includes(lowercaseSearch) ||
    exercise.category.toLowerCase().includes(lowercaseSearch) ||
    exercise.tags?.some((tag: string) => tag.toLowerCase().includes(lowercaseSearch))
  );
};

export const filterExercisesByDifficulty = (exercises: any[], difficulty: string) => {
  if (difficulty === 'All') return exercises;
  return exercises.filter(exercise => exercise.difficulty === difficulty);
};

export const filterExercisesByCategory = (exercises: any[], category: string) => {
  if (category === 'All') return exercises;
  return exercises.filter(exercise => exercise.category === category);
};

export const getExerciseById = (exercises: any[], id: string) => {
  return exercises.find(exercise => exercise.id === id);
};