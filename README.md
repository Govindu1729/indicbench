# IndicBench

> India's first comprehensive AI benchmark suite evaluating LLMs on Legal, Healthcare, Fintech, Vernacular & Education tasks. Built at IIT Gandhinagar for the IndiaAI Mission.

## Overview

IndicBench provides:
- **Domain-specific benchmarks** for Indian use cases
- **Real-time evaluation** of AI models on Indian data
- **Leaderboards** across 5 domains: Legal, Healthcare, Fintech, Vernacular, Education
- **API access** for programmatic evaluation and results export

## Getting Started

### Prerequisites

- Node.js 20+ or Bun 1.3+
- SQLite (included with Prisma)

### Installation

```bash
# Install dependencies
bun install

# Set up database
bun run db:generate
bun run db:push

# Start development server
bun run dev
```

## Project Structure

```
indicbench/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── page.tsx      # Main page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   └── lib/
│       ├── api.ts        # API client
│       ├── db.ts         # Prisma client
│       └── sample-questions.ts  # Test questions
├── prisma/
│   └── schema.prisma     # Database schema
└── tests/
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leaderboard` | GET | Get leaderboard rankings |
| `/api/models` | GET | List all AI models |
| `/api/benchmarks` | GET | List all benchmarks |
| `/api/evaluate` | POST | Run model evaluation |
| `/api/submit-benchmark` | POST | Submit new benchmark |
| `/api/stats` | GET | Get platform statistics |

## Development

```bash
# Lint
bun run lint

# Database commands
bun run db:migrate      # Run migrations
bun run db:reset       # Reset database
```

## Security

- Input validation on all endpoints
- Rate limiting on evaluation API
- Environment variable validation
- CORS protection

## License

MIT License - See LICENSE file
# 🇮🇳 IndicBench – India's AI Benchmark Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Bun Runtime](https://img.shields.io/badge/Runtime-Bun-white?logo=bun)](https://bun.sh/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**IndicBench** is one of the first open‑source benchmark platforms built specifically to evaluate AI models on Indian‑centric tasks.  
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
```

---

## 📚 Documentation

- **[Architecture & Setup](docs/SETUP.md)** – Detailed setup guide
- **[BenchLM Integration](docs/BENCHLM-INTEGRATION.md)** – External data sync
- **[API Reference](docs/API.md)** – Full API documentation

---

## 🔗 Links

- **Live Site**: https://indicbench.iitgn.ac.in
- **IIT Gandhinagar**: https://www.iitgn.ac.in
- **IndiaAI Mission**: https://indiaai.gov.in

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting PRs.

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.
