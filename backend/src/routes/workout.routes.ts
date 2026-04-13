import { Router } from "express";
import { db } from "../db";

export const workoutRoutes = Router();

workoutRoutes.post("/", async (req, res) => {
    try {
        const { userId, exerciseName, weightKg, sets, reps, setNumber, sessionId } = req.body;
        if (!userId || !exerciseName) {
            return res.status(400).json({ error: "userId e exerciseName são obrigatórios" });
        }

        const result = await db.query(
            `INSERT INTO workout_logs (user_id, exercise_name, weight_kg, sets, reps, set_number, session_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, exerciseName, weightKg ?? null, sets ?? null, reps ?? null, setNumber ?? null, sessionId ?? null]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

workoutRoutes.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(
            "SELECT * FROM workout_logs WHERE user_id = $1 ORDER BY logged_at DESC, set_number ASC",
            [userId]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});
