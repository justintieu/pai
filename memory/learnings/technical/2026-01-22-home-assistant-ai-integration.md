# Home Assistant AI Integration

**Date:** 2026-01-22

## Pattern

REST command to AI backend, automations trigger it.

```yaml
rest_command:
  ask_ai:
    url: "http://backend:3000/api/chat"
    method: POST
    payload: '{"message": "{{ message }}"}'

automation:
  - alias: "Morning Briefing"
    trigger:
      platform: time
      at: "07:00:00"
    action:
      - service: rest_command.ask_ai
        data:
          message: "Morning briefing"
      - service: tts.speak
        data:
          message: "{{ response }}"
```

## Presence Detection

| Method | Reliability |
|--------|-------------|
| Phone WiFi/GPS | Good (HA Companion app) |
| Bluetooth beacons | Better |
| mmWave radar | Best (detects stationary) |

## Voice Satellites

- ESP32-S3 Box (~$40) for local wake word
- Audio streams to Home Assistant
- HA routes to AI backend
- Response back via TTS

## Hardware Starter (~$100)

- Raspberry Pi 4: $55
- ESP32-S3 Box: $40
- Old tablet for dashboard: $0
