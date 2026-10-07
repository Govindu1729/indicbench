# BenchLM Integration - API Key Added

## Configuration

The BenchLM API key has been added to `.env`:

```
BENCHLM_API_KEY=bld_free_OPI9S-a7dx-uww7_gv_Ggl7BmEDH5ypJOR_WLQhahME
BENCHLM_API_URL=https://data.benchlm.ai/v1
```

## API Details

| Detail | Value |
|--------|-------|
| **Plan** | Free (1,000 reads/month) |
| **Rate Limit** | 10 requests/minute |
| **Monthly Reset** | November 8, 2026 |
| **Base URL** | https://data.benchlm.ai/v1 |

## New Endpoints

### `/api/benchlm-sync`
Fetches raw data from BenchLM.

```bash
curl -X POST http://localhost:3000/api/benchlm-sync \
  -H 'Content-Type: application/json' \
  -d '{"type": "models"}'
```

### `/api/benchlm-import`
Imports BenchLM rankings to your local database.

```bash
curl -X POST http://localhost:3000/api/benchlm-import
```

## Usage Notes

- **Do not commit `.env`** to git (already in `.gitignore`)
- Monitor usage: `/api/benchlm-sync` with `type: "usage"`
- Monthly allowance resets November 8, 2026 at 12:13 AM UTC

## Files Added

```
src/lib/benchlm.ts
src/app/api/benchlm-sync/route.ts
src/app/api/benchlm-import/route.ts
docs/BENCHLM-INTEGRATION.md
```

## Next Steps

1. **Test API connection**: Run `curl http://localhost:3000/api/benchlm-sync` (POST with type: usage)
2. **Import data**: If successful, run import endpoint
3. **Update leaderboard**: Modify `/api/leaderboard` to merge BenchLM data
