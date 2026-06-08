import { http } from "./http";

export type WorkoutSession = {
    id: number;
    user_id: number;
    name: string;
    exercise_count: number;
    set_count: number;
    started_at: string;
};

export async function createSession(userId: number, name: string): Promise<WorkoutSession> {
    const res = await http.post("/workout-sessions", { userId, name });
    return res.data;
}

export async function getSessions(userId: number): Promise<WorkoutSession[]> {
    const res = await http.get(`/workout-sessions/${userId}`);
    return res.data;
}
