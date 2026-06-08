import { http } from "./http";

export async function addWaterIntake(userId: number, ml: number): Promise<void> {
    await http.post("/water", { userId, ml });
}

export async function getTodayWater(userId: number): Promise<number> {
    const res = await http.get(`/water/${userId}/today`);
    return res.data.total_ml as number;
}
