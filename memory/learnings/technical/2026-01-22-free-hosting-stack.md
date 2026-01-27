# Free/Cheap Hosting Stack

**Date:** 2026-01-22

## The $0 Stack

```
Users → Cloudflare (CDN/SSL) → Oracle Free (origin)
Images → Cloudinary (optimization)
```

## Oracle Cloud Free Tier

- **Specs:** 4 ARM cores, 24GB RAM, 200GB storage, 10TB bandwidth
- **Catches:**
  - Hard to get capacity (scripted retries needed)
  - Idle reclamation: warning email → stopped → 30 days → deleted
  - Confusing UI
- **Prevention:** Keep-alive cron job for low-activity periods
- **Good for:** Always-on services, Docker workloads, web hosting

## Other Free VPS Options (Why Oracle Wins)

| Provider | Free Tier | Catches |
|----------|-----------|---------|
| Google Cloud | e2-micro (0.25 vCPU, 1GB) | Very limited specs |
| AWS | t2.micro (1 vCPU, 1GB) | 12 months only |
| Azure | B1s (1 vCPU, 1GB) | 12 months only |
| Fly.io | 3 shared VMs, 256MB each | Burns through quickly |
| Railway | $5 credit/mo | Not enough for always-on |

**Oracle wins because:** 4 ARM cores + 24GB RAM + forever free. Nothing else comes close.

## Hetzner (Paid Alternative)

- CAX11: €4/mo (2 cores, 4GB) - tight for multi-project
- CAX21: €7/mo (4 cores, 8GB) - sweet spot
- No games, instant provisioning, reliable

## CDN Options

| Service | Free | Paid |
|---------|------|------|
| Cloudflare | Unlimited CDN/DNS/SSL | $20/mo for image optimization |
| Bunny | None | ~$0.01/GB CDN, $9.50/mo optimizer |

## Image Optimization

| Service | Free Tier |
|---------|-----------|
| Cloudinary | 25GB storage + 25GB bandwidth/mo |
| ImageKit | 20GB bandwidth/mo |

## Decision Framework

- Starting out → Oracle + Cloudflare + Cloudinary (all free)
- Need reliability → Hetzner €7/mo
- Need image optimization beyond free → Bunny $9.50/mo
