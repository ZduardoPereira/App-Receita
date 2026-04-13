import { Router } from "express";
import { db } from "../db";

export const profileRoutes = Router();

profileRoutes.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(
            "SELECT id, email, display_name, avatar_uri FROM users WHERE id = $1",
            [userId]
        );
        if (!result.rows[0]) return res.status(404).json({ error: "usuário não encontrado" });
        return res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

profileRoutes.put("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { displayName, avatarUri } = req.body;
        const result = await db.query(
            `UPDATE users SET
                display_name = COALESCE($1, display_name),
                avatar_uri   = COALESCE($2, avatar_uri)
             WHERE id = $3
             RETURNING id, email, display_name, avatar_uri`,
            [displayName ?? null, avatarUri ?? null, userId]
        );
        return res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});
