# BenchLM Integration Notes

## What is BenchLM?

BenchLM is an external benchmark aggregation service that provides:
- Current AI model rankings across multiple benchmarks
- Model catalog with metadata
- Aggregated "BenchAlign" scores

## Integration Status

### API Configuration
- **Base URL**: `https://data.benchlm.ai/v1`
- **Key**: Free tier (1,000 reads/month)
- **Rate Limit**: 10 requests/minute

### New Endpoints

| Route | Purpose |
|-------|---------|
| `/api/benchlm-sync` | Fetch raw data from BenchLM |
| `/api/benchlm-import` | Import rankings to local DB |

### Files Added
- `src/lib/benchlm.ts` - API client
- `src/app/api/benchlm-sync/route.ts` - Sync endpoint
- `src/app/api/benchlm-import/route.ts` - Database import

### Usage Example

```bash
# Check current usage
curl 'http://localhost:3000/api/benchlm-sync'

# Import to database
curl -X POST http://localhost:3000/api/benchlm-import \
  -H 'Content-Type: application/json'
```

## Monthly Reset
Free plan resets: **November 8, 2026 at 12:13 AM UTC**

Current allowance: 1,000 reads/month
