import { http } from "./http";

export type WorkoutTemplate = {
    id: number;
    user_id: number;
    name: string;
    exercises: string[];
    created_at: string;
};

export async function getUserTemplates(userId: number): Promise<WorkoutTemplate[]> {
    const res = await http.get(`/workout-templates/${userId}`);
    return res.data;
}

export async function saveTemplate(userId: number, name: string, exercises: string[]): Promise<WorkoutTemplate> {
    const res = await http.post("/workout-templates", { userId, name, exercises });
    return res.data;
}

export async function deleteTemplate(id: number): Promise<void> {
    await http.delete(`/workout-templates/${id}`);
}
