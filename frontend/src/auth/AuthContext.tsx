import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type AuthContextValue = {
    isLoggedIn: boolean;
    userId: number | null;
    token: string | null;
    login: (userId: number, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const value = useMemo(
        () => ({
            isLoggedIn,
            userId,
            token,
            login: (id: number, tk: string) => {
                setUserId(id);
                setToken(tk);
                setIsLoggedIn(true);
            },
            logout: () => {
                setUserId(null);
                setToken(null);
                setIsLoggedIn(false);
            },
        }),
        [isLoggedIn, userId, token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}