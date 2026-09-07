# 🇮🇳 IndicBench – India’s AI Benchmark Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Bun Runtime](https://img.shields.io/badge/Runtime-Bun-white?logo=bun)](https://bun.sh/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**IndicBench** is the first open‑source benchmark platform built specifically to evaluate AI models on Indian‑centric tasks.  
From understanding legal documents in Hindi to solving JEE problems, we measure what matters for India.

---

## 🧭 Why IndicBench?

Most global benchmarks (MMLU, GLUE, HELM) are designed for Western contexts and English.  
India speaks **22 official languages**, has its own legal system, unique financial infrastructure (UPI, GST), and a diverse cultural landscape.

IndicBench bridges this gap by providing **domain‑specific, culturally aware** benchmarks that help:

- **Researchers** – test models on real Indian problems.
- **Enterprises** – choose the right model for Indian users.
- **Policymakers** – understand AI capabilities and risks in the Indian ecosystem.
- **Developers** – build and evaluate AI systems that truly serve India.

---

## ✨ What's Inside?

| Feature | Description |
|--------|-------------|
| 📊 **Leaderboard** | Real‑time rankings with filters for category, difficulty, and provider. |
| 🔍 **Model Comparison** | Side‑by‑side performance view – accuracy, latency, cost, and more. |
| 🧪 **Live Evaluation** | Run your own test against any benchmark using your preferred LLM. |
| 📈 **Analytics Dashboard** | Heatmaps, trend lines, and cost‑performance trade‑offs. |
| 🗂️ **5 Domain Categories** | Legal, Healthcare, Fintech, Vernacular, Education – 17+ benchmarks. |
| 🌍 **Multilingual** | Hindi, Tamil, Bengali, Hinglish, and more. |

---

## ⚡ Quick Start

Get IndicBench running on your machine in under 2 minutes:

```bash
git clone https://github.com/Govindu1729/indicbench.git
cd indicbench
bun install
cp .env.example .env
bun run db:generate && bun run db:push
bunx prisma db seed
bun run dev
