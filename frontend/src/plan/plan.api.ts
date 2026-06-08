import { http } from "../services/http";

export type CreatePlanRequest = {
  userId: number;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  goalWeight: "maintain" | "gain" | "lose";
  goalTraining: "strength" | "hypertrophy";
  intensity: "light" | "moderate" | "intense";
};

export type PlanResponse = {
  id: number;
  user_id: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water_ml: number;
  goal_weight: "maintain" | "gain" | "lose";
  goal_training: "strength" | "hypertrophy";
  intensity: "light" | "moderate" | "intense";
  gender: "male" | "female";
  weight: number;
  height: number;
  age: number;
  created_at: string;
};

export async function createPlan(data: CreatePlanRequest) {
  const res = await http.post("/plans", data);
  return res.data;
}

export async function getLatestPlan(userId: number): Promise<PlanResponse | null> {
  try {
    const res = await http.get(`/plans/${userId}/latest`);
    return res.data;
  } catch {
    return null;
  }
}