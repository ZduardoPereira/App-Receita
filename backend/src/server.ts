import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes";
import { planRoutes } from "./routes/plan.routes";

const app = express();

app.use(cors());
app.use(express.json());


app.use("/auth", authRoutes);

app.use("/plans", planRoutes);

app.get("/health", (_req, res) => {
    res.json({ ok: true});
});


const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API rodando em http://localhost:${PORT}`)
});