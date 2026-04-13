-- Perfil do usuário
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_uri   TEXT;

-- Templates de treino salvos pelo usuário
CREATE TABLE IF NOT EXISTS workout_templates (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    exercises    JSONB NOT NULL DEFAULT '[]',
    created_at   TIMESTAMP DEFAULT NOW()
);

-- Sessões de treino
CREATE TABLE IF NOT EXISTS workout_sessions (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    started_at   TIMESTAMP DEFAULT NOW()
);

-- Vincular logs a sessões
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS session_id INTEGER REFERENCES workout_sessions(id);
