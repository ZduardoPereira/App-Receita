import { Router } from "express";
import { db } from "../db";

export const weightRoutes = Router();

weightRoutes.post("/", async (req, res) => {
    try {
        const { userId, weight } = req.body;
        if (!userId || weight == null) {
            return res.status(400).json({ error: "userId e weight são obrigatórios" });
        }

        const result = await db.query(
            "INSERT INTO weight_logs (user_id, weight) VALUES ($1, $2) RETURNING *",
            [userId, weight]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

weightRoutes.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(
            "SELECT * FROM weight_logs WHERE user_id = $1 ORDER BY recorded_at ASC",
            [userId]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});