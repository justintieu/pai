# PAI Roadmap

## Vision

PAI as an ambient Life OS accessible from anywhere - phone, car, home, voice - that can act autonomously on your behalf.

---

## Phases

### Phase 1: Foundation ✅

- [x] PAI CLI (`pai` commands)
- [x] File-based context/memory system
- [x] Claude Code integration
- [x] Skills and agents framework
- [x] Git-based sync

### Phase 2: Backend API

Enable remote access to PAI from any interface.

- [ ] API server on CDE
- [ ] Claude Code bridge
- [ ] WebSocket real-time
- [ ] Authentication

### Phase 2.5: Scoped Sync

Partial sync for different devices (work vs personal).

**Model:**
- `full` = Everything (personal = full)
- `work` = Business mind (excludes personal life)
- `work-{company}` = Work + company-specific workspace

**Components:**
- [ ] Profile hierarchy (`full` → `work` → `work-{company}`)
- [ ] Scoped indexes (`index.md` = full, `index.work.md` = filtered)
- [ ] Device tokens with profile assignment
- [ ] `pai sync` uses device's assigned profile
- [ ] Cloud CDE = source of truth

**Profile hierarchy:**
```
full (everything)
  └── work (business mind, no personal)
        ├── work-companyA (+ companyA workspace)
        └── work-companyB (+ companyB workspace)
```

**Index structure:**
```
context/
├── index.md           # Full view
├── index.work.md      # Work view (excludes personal)
├── preferences.md     # Both
├── identity/          # Full only
└── relationships/     # Full only
```

**Device matrix:**
| Device | Profile | Sees |
|--------|---------|------|
| Personal laptop | full | Everything |
| Phone | full | Everything |
| Work laptop | work-companyA | Business + companyA |
| Client device | work-clientB | Business + clientB |

### Phase 3: Mobile App

Full PAI access from phone.

- [ ] Chat with Atlas
- [ ] Quick capture (voice/text → learnings, notes)
- [ ] Goals dashboard
- [ ] Work status view
- [ ] Push notifications

### Phase 4: Voice (Car)

"Hey Siri, call Atlas" hands-free.

- [ ] SIP phone number (~$3-5/mo)
- [ ] Speech-to-text (Whisper)
- [ ] Text-to-speech (Piper)
- [ ] Car Bluetooth integration

### Phase 5: Autonomous Agent

PAI acts on your behalf with guardrails.

- [ ] Discord bot (read/reply)
- [ ] Email (IMAP + SMTP)
- [ ] Slack integration
- [ ] Calendar integration
  - [ ] Mirror event detection (dedupe blocking events across calendars)
- [ ] Trust levels (auto/approve/notify/ignore)

### Phase 6: IoT / Home

Ambient PAI throughout home.

- [ ] Home Assistant integration
- [ ] Smart speaker voice
- [ ] Wall display dashboard
- [ ] Presence detection
- [ ] Morning/evening briefings

---

## Principles

1. **Vendor abstraction** - Never couple to a provider. Define interfaces, swap implementations.
2. **Privacy first** - Self-host where possible (STT, TTS, embeddings).
3. **Scoped access** - Different devices see different slices. Work laptop ≠ personal.
4. **Progressive enhancement** - Start simple, add capabilities.
5. **Cost conscious** - Free tiers first, pay only when needed.

---

## Cost Target

| Tier | Monthly Cost |
|------|--------------|
| Free (Oracle + free tiers) | ~$3-5/mo |
| Reliable (Hetzner + services) | ~€10-12/mo |

---

## Next Steps

1. Set up CDE (Oracle or Hetzner)
2. Build backend API
3. Create mobile PWA
4. Add voice
