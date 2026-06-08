import { Router } from "express";
import { db } from "../db";

export const foodLogRoutes = Router();

foodLogRoutes.post("/", async (req, res) => {
    try {
        const { userId, mealType, foodName, calories, protein, carbs, fat, grams } = req.body;
        if (!userId || !mealType || !foodName)
            return res.status(400).json({ error: "userId, mealType e foodName são obrigatórios" });

        const result = await db.query(
            `INSERT INTO food_logs (user_id, meal_type, food_name, calories, protein, carbs, fat, grams)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [userId, mealType, foodName, calories ?? 0, protein ?? 0, carbs ?? 0, fat ?? 0, grams ?? 100]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

foodLogRoutes.get("/:userId/today", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(
            `SELECT * FROM food_logs
             WHERE user_id=$1 AND logged_at::date = CURRENT_DATE
             ORDER BY logged_at ASC`,
            [userId]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

foodLogRoutes.get("/:userId/daily", async (req, res) => {
    try {
        const { userId } = req.params;
        const days = Number(req.query.days ?? 30);
        const result = await db.query(
            `SELECT
                logged_at::date                     AS date,
                COALESCE(SUM(calories), 0)::numeric AS calories,
                COALESCE(SUM(protein),  0)::numeric AS protein,
                COALESCE(SUM(carbs),    0)::numeric AS carbs,
                COALESCE(SUM(fat),      0)::numeric AS fat
             FROM food_logs
             WHERE user_id=$1 AND logged_at >= NOW() - ($2 || ' days')::INTERVAL
             GROUP BY logged_at::date
             ORDER BY date DESC`,
            [userId, days]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});

foodLogRoutes.delete("/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM food_logs WHERE id=$1", [req.params.id]);
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "erro interno" });
    }
});
