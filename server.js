import express from "express";
import pg from "pg";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null;
const memoryScores = new Map();
const rate = new Map();

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

async function initDb() {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS leaderboard (
    id BIGSERIAL PRIMARY KEY,
    nickname VARCHAR(16) UNIQUE NOT NULL,
    score BIGINT NOT NULL CHECK (score >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}
function cleanName(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/[<>]/g, "").slice(0, 16);
}
function allow(ip) {
  const now = Date.now();
  const item = rate.get(ip) || { start: now, count: 0 };
  if (now - item.start > 60000) { item.start = now; item.count = 0; }
  item.count += 1; rate.set(ip, item);
  return item.count <= 30;
}
app.get("/api/ranking", async (_req, res) => {
  try {
    if (pool) {
      const { rows } = await pool.query("SELECT nickname, score::text AS score FROM leaderboard ORDER BY score DESC, updated_at ASC LIMIT 20");
      return res.json(rows);
    }
    const rows = [...memoryScores.entries()].map(([nickname, score]) => ({nickname, score:String(score)})).sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,20);
    res.json(rows);
  } catch { res.status(500).json({ error: "랭킹을 불러오지 못했습니다." }); }
});
app.post("/api/score", async (req, res) => {
  if (!allow(req.ip)) return res.status(429).json({ error: "요청이 너무 많습니다." });
  const nickname = cleanName(req.body.nickname);
  const score = Number(req.body.score);
  if (nickname.length < 2 || !Number.isSafeInteger(score) || score < 0 || score > 9_000_000_000) {
    return res.status(400).json({ error: "닉네임 또는 점수가 올바르지 않습니다." });
  }
  try {
    if (pool) {
      await pool.query(`INSERT INTO leaderboard(nickname, score) VALUES ($1, $2)
        ON CONFLICT(nickname) DO UPDATE SET score=GREATEST(leaderboard.score, EXCLUDED.score), updated_at=NOW()`, [nickname, score]);
    } else memoryScores.set(nickname, Math.max(memoryScores.get(nickname)||0, score));
    res.json({ ok: true, requestId: crypto.randomUUID() });
  } catch { res.status(500).json({ error: "점수를 저장하지 못했습니다." }); }
});
initDb().then(()=>app.listen(port, ()=>console.log(`http://localhost:${port}`))).catch(err=>{ console.error(err); process.exit(1); });
