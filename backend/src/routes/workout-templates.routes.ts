import { Router } from "express";
import { db } from "../db";

export const workoutTemplatesRoutes = Router();

workoutTemplatesRoutes.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(
            "SELECT * FROM workout_templates WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

workoutTemplatesRoutes.post("/", async (req, res) => {
    try {
        const { userId, name, exercises } = req.body;
        if (!userId || !name || !Array.isArray(exercises))
            return res.status(400).json({ error: "userId, name e exercises são obrigatórios" });
        const result = await db.query(
            "INSERT INTO workout_templates (user_id, name, exercises) VALUES ($1, $2, $3) RETURNING *",
            [userId, name, JSON.stringify(exercises)]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

workoutTemplatesRoutes.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM workout_templates WHERE id = $1", [id]);
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});
