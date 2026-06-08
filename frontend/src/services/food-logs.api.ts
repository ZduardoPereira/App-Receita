import { http } from "./http";

export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export interface FoodLog {
    id: number;
    user_id: number;
    meal_type: MealType;
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    grams: number;
    logged_at: string;
}

export interface DailyCalories {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export async function addFoodLog(data: {
    userId: number;
    mealType: MealType;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    grams: number;
}): Promise<FoodLog> {
    const res = await http.post("/food-logs", {
        userId: data.userId,
        mealType: data.mealType,
        foodName: data.foodName,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        grams: data.grams,
    });
    return res.data;
}

export async function getTodayFoodLogs(userId: number): Promise<FoodLog[]> {
    const res = await http.get(`/food-logs/${userId}/today`);
    return res.data;
}

export async function getDailyFoodLogs(userId: number, days = 30): Promise<DailyCalories[]> {
    const res = await http.get(`/food-logs/${userId}/daily?days=${days}`);
    return res.data;
}

export async function deleteFoodLog(id: number): Promise<void> {
    await http.delete(`/food-logs/${id}`);
}
