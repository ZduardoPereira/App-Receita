import { http } from "./http";

export type WorkoutLog = {
    id: number;
    user_id: number;
    exercise_name: string;
    weight_kg: number | null;
    sets: number | null;
    reps: number | null;
    set_number: number | null;
    session_id: number | null;
    logged_at: string;
};

export type AddWorkoutLogRequest = {
    userId: number;
    exerciseName: string;
    weightKg?: number;
    sets?: number;
    reps?: number;
    setNumber?: number;
    sessionId?: number;
};

export async function addWorkoutLog(data: AddWorkoutLogRequest): Promise<WorkoutLog> {
    const res = await http.post("/workout-logs", data);
    return res.data;
}

export async function getWorkoutLogs(userId: number): Promise<WorkoutLog[]> {
    const res = await http.get(`/workout-logs/${userId}`);
    return res.data;
}
