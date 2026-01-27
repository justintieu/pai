# Provus AI Assistant - Learnings

Project-specific technical learnings and gotchas.

---

## 2026-01-27: Docker Traefik API URL Configuration

**Problem**: Frontend getting `AxiosError: Network Error` when calling API endpoints like `/api/v1/documents`.

**Root Cause**: `NEXT_PUBLIC_API_URL` defaults to `http://localhost:3001` in docker-compose.dev.yml, but ports 3000/3001 are NOT exposed to the host—only Traefik on port 80 is accessible.

**Solution**: Create `provus-ai-web/.env`:
```
NEXT_PUBLIC_API_URL=http://localhost
```

**Why**: All traffic must route through Traefik (port 80). Direct access to `localhost:3001` fails because the port is internal to Docker network only.

**Debugging**:
```bash
# Check if backend responds directly (should fail)
curl http://localhost:3001/health

# Check via Traefik (should work)
curl http://localhost/api/v1/documents  # 401 = working, needs auth

# Verify container env
docker exec provus-ai-web-dev printenv NEXT_PUBLIC_API_URL
```

---
