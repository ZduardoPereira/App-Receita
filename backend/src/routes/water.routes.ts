import { Router } from "express";
import { db } from "../db";

export const waterRoutes = Router();

waterRoutes.post("/", async (req, res) => {
    try {
        const { userId, ml } = req.body;
        if (!userId || !ml)
            return res.status(400).json({ error: "userId e ml são obrigatórios" });

        const result = await db.query(
            "INSERT INTO water_intake (user_id, ml) VALUES ($1, $2) RETURNING *",
            [userId, ml]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

waterRoutes.get("/:userId/today", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(
            `SELECT COALESCE(SUM(ml), 0)::integer AS total_ml
             FROM water_intake
             WHERE user_id=$1 AND logged_at::date = CURRENT_DATE`,
            [userId]
        );
        return res.json({ total_ml: result.rows[0].total_ml });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});
