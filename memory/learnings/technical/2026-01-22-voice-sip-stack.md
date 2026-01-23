# Voice/SIP Stack for AI Assistants

**Date:** 2026-01-22

## The Stack

```
Phone call → SIP trunk → PBX → STT → AI → TTS → Audio back
```

## Components

| Component | Self-hosted | Cost |
|-----------|-------------|------|
| SIP trunk | voip.ms | ~$0.85/mo + $0.01/min |
| PBX | Asterisk/FreeSWITCH | $0 |
| STT | Whisper | $0 |
| TTS | Piper/Coqui | $0 |

## Why SIP over Data-only

- "Hey Siri, call X" works natively
- Car Bluetooth hands-free integration
- Works without data (cellular voice)
- Universal - any phone, any car

## Cost Comparison

| Approach | Cost |
|----------|------|
| Twilio | ~$18/mo (30 min/day) |
| voip.ms | ~$5/mo (30 min/day) |
| Data-only | $0 but no native call UX |

## Implementation Notes

- Whisper (small) runs real-time on CPU
- Piper TTS is fast and lightweight
- Asterisk handles the SIP ↔ audio bridge
- Can run on same VPS as other services
