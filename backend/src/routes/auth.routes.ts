import { Router } from "express";
import { db } from "../db";
import { hashPassword, comparePassword } from "../utils/hash";

export const authRoutes = Router();

authRoutes.post("/register", async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string};

    if (!email || !password) return res.status(400).json({ error: "email e password obrigatórios" });
    if (password.length < 6) return res.status(400).json({ error: "senha muito curta"});

    const password_hash = await hashPassword(password);

    try {
        const result = await db.query(
            "INSERT INTO users (email,password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, password_hash]
        );

        const user = result.rows[0];


        return res.status(201).json({
            token: `fake-token-${user.id}`,
            user: { id: user.id, email: user.email },
        });
    } catch (err: any){
        if (err?.code === "23505") return res.status(409).json({ error: "email já cadastrado"});
        return res.status(500).json({ error: "erro no servidor"});
    }
});

authRoutes.post("/login", async (req, res) => {
    const { email, password } = req.body as {email?: string; password?: string};

    if (!email || !password) return res.status(400).json({ error: "email e password obrigatórios"});

    const result = await db.query(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        [email]
    );

    const user = result.rows[0];
    if(!user) return res.status(401).json({ error: "credenciais inválidas"});

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "credenciais inválidas"});

    return res.json({
        token: `fake-token-${user.id}`,
        user: { id: user.id, email: user.email },
    });
})