/**
 * learning-capture.ts - Topic-aware learning capture handler
 *
 * Pure handler: receives pre-parsed transcript data, captures learnings when
 * topic completion is detected. Runs on Stop, replacing SessionEnd timing.
 *
 * COMPLETION SIGNALS (in user's last message):
 * - Gratitude: "thanks", "thank you", "thx", "ty"
 * - Confirmation: "perfect", "great", "awesome", "nice", "good", "works"
 * - Closure: "done", "finished", "that's it", "all set"
 * - Approval: "lgtm", "ship it", "approved"
 *
 * Only captures if:
 * 1. Completion signal detected in user's last message
 * 2. Significant work was done (files changed, multiple items, or manual source)
 * 3. Work hasn't already been captured this session
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getISOTimestamp, getPSTDate } from '../lib/time';
import { getLearningCategory } from '../lib/learning-utils';
import { getPaiDir } from '../lib/paths';
import { readYamlFile, writeYamlFile } from '../lib/yaml';
import type { ParsedTranscript } from '../tools/TranscriptParser';

const BASE_DIR = getPaiDir();
const MEMORY_DIR = join(BASE_DIR, 'memory');
const STATE_DIR = join(MEMORY_DIR, 'state');
const CURRENT_WORK_FILE = join(STATE_DIR, 'current-work.yaml');
const WORK_DIR = join(MEMORY_DIR, 'work');
const LEARNING_DIR = join(MEMORY_DIR, 'learning');

interface CurrentWork {
  session_id: string;
  work_dir: string;
  created_at: string;
  item_count: number;
  status: 'ACTIVE' | 'INACTIVE';
  learning_captured?: boolean;
}

interface WorkMeta {
  id: string;
  title: string;
  created_at: string;
  completed_at: string | null;
  source: string;
  status: string;
  session_id: string;
  lineage: {
    tools_used: string[];
    files_changed: string[];
    agents_spawned: string[];
  };
}

interface HookInput {
  session_id: string;
  transcript_path: string;
  hook_event_name: string;
}

// Clear completion signals - definitely done
const CLEAR_COMPLETION_PATTERNS = [
  // Explicit capture request
  /\b(capture\s+learning|log\s+(it|this|learning)|yes\s+capture)\b/i,
  // Explicit learning request
  /\/pai\s+learn/i,
];

// Ambiguous signals - might be done, ask to confirm
const AMBIGUOUS_PATTERNS = [
  // "ok" variants at start of message
  /^(ok|okay|k|kk|alright|aight|got\s*it|sounds\s*good|cool|nice)\b/i,
];

type CompletionSignal = 'clear' | 'ambiguous' | 'none';

/**
 * Detect if the user's message indicates topic completion
 */
function detectTopicCompletion(userMessage: string): CompletionSignal {
  if (!userMessage || userMessage.trim().length === 0) {
    return 'none';
  }

  // Clean up system tags
  const cleanMessage = userMessage
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();

  // Check for clear completion signals first
  for (const pattern of CLEAR_COMPLETION_PATTERNS) {
    if (pattern.test(cleanMessage)) {
      return 'clear';
    }
  }

  // Check for ambiguous signals (short messages starting with "ok" etc)
  const isShort = cleanMessage.split(/\s+/).length <= 5;
  if (isShort) {
    for (const pattern of AMBIGUOUS_PATTERNS) {
      if (pattern.test(cleanMessage)) {
        return 'ambiguous';
      }
    }
  }

  return 'none';
}

function parseYaml(content: string): WorkMeta {
  const meta: Record<string, unknown> = {
    lineage: { tools_used: [], files_changed: [], agents_spawned: [] }
  };
  const lines = content.split('\n');
  let inArray = false;
  let arrayKey = '';
  let inLineage = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ') && inArray) {
      const value = trimmed.slice(2).replace(/^["']|["']$/g, '');
      if (inLineage) {
        const lineage = meta.lineage as Record<string, string[]>;
        if (lineage[arrayKey]) {
          lineage[arrayKey].push(value);
        }
      } else {
        const arr = meta[arrayKey] as string[];
        if (arr) arr.push(value);
      }
      continue;
    }

    const match = trimmed.match(/^([a-z_]+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;

      if (key === 'lineage') {
        inLineage = true;
        inArray = false;
        continue;
      }

      if (inLineage && ['tools_used', 'files_changed', 'agents_spawned'].includes(key)) {
        arrayKey = key;
        if (value === '' || value === '[]') {
          inArray = value === '';
        }
        continue;
      }

      if (value === '' || value === '[]') {
        if (!inLineage) {
          meta[key] = [];
          arrayKey = key;
          inArray = value === '';
        }
      } else {
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (!inLineage) {
          meta[key] = cleanValue === 'null' ? null : cleanValue;
        }
        inArray = false;
      }
    }
  }

  return meta as unknown as WorkMeta;
}

function getMonthDir(category: 'SYSTEM' | 'ALGORITHM'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const monthDir = join(LEARNING_DIR, category, `${year}-${month}`);

  if (!existsSync(monthDir)) {
    mkdirSync(monthDir, { recursive: true });
  }

  return monthDir;
}

function writeLearning(workMeta: WorkMeta, idealContent: string): string | null {
  const category = getLearningCategory(workMeta.title);
  const monthDir = getMonthDir(category);

  const dateStr = getPSTDate();
  const timeStr = new Date().toISOString().split('T')[1].slice(0, 5).replace(':', '');
  const titleSlug = workMeta.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30);

  const filename = `${dateStr}_${timeStr}_work_${titleSlug}.md`;
  const filepath = join(monthDir, filename);

  if (existsSync(filepath)) {
    console.error(`[LearningCapture] Learning already exists: ${filename}`);
    return null;
  }

  let duration = 'Unknown';
  if (workMeta.created_at && workMeta.completed_at) {
    const start = new Date(workMeta.created_at);
    const end = new Date(workMeta.completed_at);
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    if (minutes < 60) {
      duration = `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      duration = `${hours}h ${mins}m`;
    }
  }

  const content = `# Work Completion Learning

**Title:** ${workMeta.title}
**Duration:** ${duration}
**Category:** ${category}
**Session:** ${workMeta.session_id}

---

## Ideal State Criteria

${idealContent || 'Not specified'}

## What Was Done

- **Files Changed:** ${workMeta.lineage?.files_changed?.length || 0}
- **Tools Used:** ${workMeta.lineage?.tools_used?.join(', ') || 'None tracked'}
- **Agents Spawned:** ${workMeta.lineage?.agents_spawned?.length || 0}

## Insights

*This work session completed successfully. Consider what made it effective:*

- Was the approach straightforward or did it require iteration?
- Were there any blockers or surprises?
- What patterns from this work apply to future tasks?

---

*Auto-captured by LearningCapture handler on topic completion*
`;

  writeFileSync(filepath, content);
  console.error(`[LearningCapture] Created learning: ${filename}`);
  return filepath;
}

function markWorkAsCaptured(currentWork: CurrentWork): void {
  try {
    currentWork.learning_captured = true;
    currentWork.status = 'INACTIVE';
    writeYamlFile(CURRENT_WORK_FILE, currentWork as unknown as Record<string, unknown>);
  } catch (error) {
    console.error('[LearningCapture] Error marking work as captured:', error);
  }
}

/**
 * Check if we have significant work worth capturing
 */
function checkSignificantWork(): { hasWork: boolean; currentWork?: CurrentWork; workMeta?: WorkMeta } {
  const currentWork = readYamlFile<CurrentWork>(CURRENT_WORK_FILE);
  if (!currentWork) {
    return { hasWork: false };
  }

  if (currentWork.status === 'INACTIVE' || currentWork.learning_captured || !currentWork.work_dir) {
    return { hasWork: false };
  }

  const workPath = join(WORK_DIR, currentWork.work_dir);
  const metaPath = join(workPath, 'META.yaml');

  if (!existsSync(metaPath)) {
    return { hasWork: false };
  }

  const metaContent = readFileSync(metaPath, 'utf-8');
  const workMeta = parseYaml(metaContent);

  const hasSignificantWork = (
    (workMeta.lineage?.files_changed?.length || 0) > 0 ||
    currentWork.item_count > 1 ||
    workMeta.source === 'MANUAL'
  );

  if (!hasSignificantWork) {
    return { hasWork: false };
  }

  return { hasWork: true, currentWork, workMeta };
}

/**
 * Handle learning capture with pre-parsed transcript data.
 * Only captures when topic completion is detected.
 */
export async function handleLearningCapture(
  parsed: ParsedTranscript,
  hookInput: HookInput
): Promise<void> {
  const { lastUserMessage } = parsed;

  // 1. Check for completion signal
  const signal = detectTopicCompletion(lastUserMessage);

  if (signal === 'none') {
    return;
  }

  // 2. Check if we have significant work
  const { hasWork, currentWork, workMeta } = checkSignificantWork();

  if (!hasWork || !currentWork || !workMeta) {
    return;
  }

  // 3. Handle ambiguous signal - prompt user
  if (signal === 'ambiguous') {
    // Output prompt to stdout (gets injected into next response)
    console.log(`Done with this topic? Say "capture learning" to log insights.`);
    return;
  }

  // 4. Clear signal - capture the learning
  console.error('[LearningCapture] Topic completion confirmed, capturing...');

  if (!workMeta.completed_at) {
    workMeta.completed_at = getISOTimestamp();
  }

  // 5. Load ideal state if exists
  const workPath = join(WORK_DIR, currentWork.work_dir);
  const idealPath = join(workPath, 'IDEAL.md');
  let idealContent = '';
  if (existsSync(idealPath)) {
    idealContent = readFileSync(idealPath, 'utf-8').trim();
  }

  // 6. Write learning
  const filepath = writeLearning(workMeta, idealContent);

  // 7. Mark as captured to prevent duplicates
  if (filepath) {
    markWorkAsCaptured(currentWork);
  }
}
