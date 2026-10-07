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
