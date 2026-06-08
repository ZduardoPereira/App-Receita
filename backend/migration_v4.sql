-- Log de alimentos consumidos por refeição
CREATE TABLE IF NOT EXISTS food_logs (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type  VARCHAR(50) NOT NULL,   -- breakfast | lunch | snack | dinner
    food_name  VARCHAR(255) NOT NULL,
    calories   DECIMAL(8,2) DEFAULT 0,
    protein    DECIMAL(6,2) DEFAULT 0,
    carbs      DECIMAL(6,2) DEFAULT 0,
    fat        DECIMAL(6,2) DEFAULT 0,
    grams      DECIMAL(6,2) DEFAULT 100,
    logged_at  TIMESTAMP DEFAULT NOW()
);

-- Log de consumo de água (ml por dia)
CREATE TABLE IF NOT EXISTS water_intake (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ml         INTEGER NOT NULL,
    logged_at  TIMESTAMP DEFAULT NOW()
);
