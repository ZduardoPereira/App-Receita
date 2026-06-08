import { http } from "./http";

export type WeightLog = {
    id: number;
    user_id: number;
    weight: number;
    recorded_at: string;
};

export async function addWeightLog(userId: number, weight: number): Promise<WeightLog> {
    const res = await http.post("/weight-logs", { userId, weight });
    return res.data;
}

export async function getWeightLogs(userId: number): Promise<WeightLog[]> {
    const res = await http.get(`/weight-logs/${userId}`);
    return res.data;
}
