import { Router } from "express";
import { db } from "../db";

export const planRoutes = Router();

planRoutes.post("/", async (req, res) => {
  const {
    userId,
    weight,
    height,
    age,
    gender,
    goalWeight,
    goalTraining,
    intensity,
  } = req.body;

  if (
    !userId ||
    !weight ||
    !height ||
    !age ||
    !gender ||
    !goalWeight ||
    !goalTraining ||
    !intensity
  ) {
    return res.status(400).json({ error: "dados incompletos" });
  }

  // 1️⃣ Calcular TMB
  let tmb;

  if (gender === "male") {
    tmb = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    tmb = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2️⃣ Fator de atividade
  let activityFactor = 1.4;

  if (intensity === "moderate") activityFactor = 1.6;
  if (intensity === "intense") activityFactor = 1.8;

  let calories = tmb * activityFactor;

  // 3️⃣ Ajuste objetivo de peso
  let adjustment = 0;

  if (goalWeight === "gain") adjustment = 400;
  if (goalWeight === "lose") adjustment = -400;

  calories = Math.round(calories + adjustment);

  // 4️⃣ Macros
  let proteinPerKg = 1.8;

  if (goalWeight === "gain") proteinPerKg = 2;
  if (goalWeight === "lose") proteinPerKg = 2.2;

  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.round(weight * 0.8);

  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;

  const remainingCalories = calories - (proteinCalories + fatCalories);
  const carbs = Math.round(remainingCalories / 4);

  // 5️⃣ Água
  const water_ml = Math.round(weight * 35);

  // 6️⃣ Salvar no banco
  const result = await db.query(
    `INSERT INTO plans 
     (user_id, weight, height, age, gender, goal_weight, goal_training, intensity,
      calories, protein, carbs, fat, water_ml)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      userId,
      weight,
      height,
      age,
      gender,
      goalWeight,
      goalTraining,
      intensity,
      calories,
      protein,
      carbs,
      fat,
      water_ml,
    ]
  );

  return res.json(result.rows[0]);
});