import { http } from "../services/http";

export type AuthResponse = {
    token: string;
    user: { id: number; email: string};
};

export type LoginRequest = {
    token: string;
    user: {id: number; email: string};
};

export type LoginResponse = {
    token: string;
    user: { id: number; email: string };
};

export async function loginApi(email: string, password: string) {
    const res = await http.post<LoginResponse>('/auth/login', {
        email,
        password,
    });
    return res.data;
};

export async function registerApi(email: string, password: string) {
    const res = await http.post<AuthResponse>("/auth/register", {email, password});
    return res.data;
}