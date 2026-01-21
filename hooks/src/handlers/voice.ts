/**
 * voice.ts - Voice notification handler
 *
 * Pure handler: receives pre-parsed transcript data, sends to voice server.
 * No I/O for transcript reading - that's done by orchestrator.
 *
 * Graceful degradation: If voice server is not running or no ElevenLabs
 * API key is configured, this handler silently does nothing.
 */

import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { paiPath, getClaudeDir } from '../lib/paths';
import { getIdentity } from '../lib/identity';
import { getISOTimestamp } from '../lib/time';
import { isValidVoiceCompletion, getVoiceFallback } from '../lib/response-format';
import { getNotificationConfig } from '../lib/notifications';
import type { ParsedTranscript } from '../tools/TranscriptParser';

const DA_IDENTITY = getIdentity();

interface NotificationPayload {
  title: string;
  message: string;
  voice_enabled: boolean;
  priority?: 'low' | 'normal' | 'high';
  voice_id: string;
}

interface VoiceEvent {
  timestamp: string;
  session_id: string;
  event_type: 'sent' | 'failed' | 'skipped';
  message: string;
  character_count: number;
  voice_id: string;
  status_code?: number;
  error?: string;
}

const VOICE_LOG_PATH = paiPath('memory', 'voice', 'voice-events.jsonl');
const CURRENT_WORK_PATH = paiPath('memory', 'state', 'current-work.json');

function getActiveWorkDir(): string | null {
  try {
    if (!existsSync(CURRENT_WORK_PATH)) return null;
    const content = readFileSync(CURRENT_WORK_PATH, 'utf-8');
    const state = JSON.parse(content);
    if (state.work_dir) {
      const workPath = paiPath('memory', 'work', state.work_dir);
      if (existsSync(workPath)) return workPath;
    }
  } catch {
    // Silent fail
  }
  return null;
}

function logVoiceEvent(event: VoiceEvent): void {
  const line = JSON.stringify(event) + '\n';

  try {
    const dir = paiPath('memory', 'voice');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    appendFileSync(VOICE_LOG_PATH, line);
  } catch {
    // Silent fail
  }

  try {
    const workDir = getActiveWorkDir();
    if (workDir) {
      appendFileSync(join(workDir, 'voice.jsonl'), line);
    }
  } catch {
    // Silent fail
  }
}

async function sendNotification(payload: NotificationPayload, sessionId: string): Promise<void> {
  const config = getNotificationConfig();
  const serverUrl = config.voice.serverUrl || 'http://localhost:8888';

  const baseEvent: Omit<VoiceEvent, 'event_type' | 'status_code' | 'error'> = {
    timestamp: getISOTimestamp(),
    session_id: sessionId,
    message: payload.message,
    character_count: payload.message.length,
    voice_id: payload.voice_id,
  };

  try {
    const response = await fetch(`${serverUrl}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Voice] Server error:', response.statusText);
      logVoiceEvent({
        ...baseEvent,
        event_type: 'failed',
        status_code: response.status,
        error: response.statusText,
      });
    } else {
      logVoiceEvent({
        ...baseEvent,
        event_type: 'sent',
        status_code: response.status,
      });
    }
  } catch (error) {
    // Graceful degradation - voice server not running is expected
    // Don't log as error, just skip
    logVoiceEvent({
      ...baseEvent,
      event_type: 'skipped',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Handle voice notification with pre-parsed transcript data.
 */
export async function handleVoice(parsed: ParsedTranscript, sessionId: string): Promise<void> {
  // Check if voice is enabled
  const config = getNotificationConfig();
  if (!config.voice.enabled) {
    console.error('[Voice] Voice notifications disabled');
    return;
  }

  let voiceCompletion = parsed.voiceCompletion;

  // Validate voice completion
  if (!isValidVoiceCompletion(voiceCompletion)) {
    console.error(`[Voice] Invalid completion: "${voiceCompletion.slice(0, 50)}..."`);
    voiceCompletion = getVoiceFallback();
  }

  // Skip empty or too-short messages
  if (!voiceCompletion || voiceCompletion.length < 5) {
    console.error('[Voice] Skipping - message too short or empty');
    return;
  }

  const payload: NotificationPayload = {
    title: DA_IDENTITY.name,
    message: voiceCompletion,
    voice_enabled: true,
    priority: 'normal',
    voice_id: DA_IDENTITY.voiceId,
  };

  await sendNotification(payload, sessionId);
}
