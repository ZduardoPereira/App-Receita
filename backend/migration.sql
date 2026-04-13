-- Tabela de histórico de peso
CREATE TABLE IF NOT EXISTS weight_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight      DECIMAL(5,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs de treino
CREATE TABLE IF NOT EXISTS workout_logs (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    weight_kg     DECIMAL(6,2),
    sets          INTEGER,
    reps          INTEGER,
    logged_at     TIMESTAMP DEFAULT NOW()
);

-- Adiciona created_at na tabela plans (caso não exista)
ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();