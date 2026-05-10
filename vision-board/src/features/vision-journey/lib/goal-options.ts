import { VISION_GOALS, type VisionGoal } from "../config/goals";

export function generateGoalOptions(likedCards: number[]): VisionGoal[] {
  const related = VISION_GOALS.filter((goal) =>
    goal.cardIds.some((cardId) => likedCards.includes(cardId))
  );
  const extras = VISION_GOALS.filter(
    (goal) => !related.find((relatedGoal) => relatedGoal.id === goal.id)
  );

  const selected = [...related.slice(0, 3)];
  if (selected.length < 3) {
    selected.push(...extras.slice(0, 3 - selected.length));
  }
  if (selected.length < 4 && likedCards.length > 4) {
    selected.push(extras[0]);
  }

  return selected.slice(0, 4);
}
