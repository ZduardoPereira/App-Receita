import { Router } from "express";
import { db } from "../db";

export const workoutSessionsRoutes = Router();

workoutSessionsRoutes.post("/", async (req, res) => {
    try {
        const { userId, name } = req.body;
        if (!userId || !name)
            return res.status(400).json({ error: "userId e name são obrigatórios" });
        const result = await db.query(
            "INSERT INTO workout_sessions (user_id, name) VALUES ($1, $2) RETURNING *",
            [userId, name]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

workoutSessionsRoutes.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(
            `SELECT ws.*,
                    COUNT(DISTINCT wl.exercise_name)::int AS exercise_count,
                    COUNT(wl.id)::int                     AS set_count
             FROM workout_sessions ws
             LEFT JOIN workout_logs wl ON wl.session_id = ws.id
             WHERE ws.user_id = $1
             GROUP BY ws.id
             ORDER BY ws.started_at DESC
             LIMIT 50`,
            [userId]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});
