import { http } from "./http";

export type UserProfile = {
    id: number;
    email: string;
    display_name: string | null;
    avatar_uri: string | null;
};

export async function getProfile(userId: number): Promise<UserProfile> {
    const res = await http.get(`/profile/${userId}`);
    return res.data;
}

export async function updateProfile(userId: number, data: { displayName?: string; avatarUri?: string }): Promise<UserProfile> {
    const res = await http.put(`/profile/${userId}`, data);
    return res.data;
}
