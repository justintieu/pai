/**
 * metadata-extraction.ts - Extract metadata from transcripts and responses
 *
 * Utilities for parsing structured metadata from Claude's responses.
 */

export interface ExtractedMetadata {
  summary?: string;
  actions?: string[];
  status?: string;
  nextSteps?: string[];
  errors?: string[];
  warnings?: string[];
}

/**
 * Extract structured metadata from a response text
 */
export function extractMetadata(text: string): ExtractedMetadata {
  const metadata: ExtractedMetadata = {};

  // Remove system reminders
  const cleanText = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '');

  // Extract summary
  const summaryMatch = cleanText.match(/📋\s*SUMMARY:\s*(.+?)(?:\n|$)/i);
  if (summaryMatch) {
    metadata.summary = summaryMatch[1].trim();
  }

  // Extract status
  const statusMatch = cleanText.match(/📊\s*STATUS:\s*(.+?)(?:\n|$)/i);
  if (statusMatch) {
    metadata.status = statusMatch[1].trim();
  }

  // Extract actions (bullet points after ACTIONS:)
  const actionsMatch = cleanText.match(/⚡\s*ACTIONS:\s*([\s\S]*?)(?=\n[📊✅➡️🗣️]|\n\n|$)/i);
  if (actionsMatch) {
    const actionLines = actionsMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[\s\-•]+/, '').trim())
      .filter(Boolean);
    if (actionLines.length > 0) {
      metadata.actions = actionLines;
    }
  }

  // Extract next steps
  const nextMatch = cleanText.match(/➡️\s*NEXT:\s*([\s\S]*?)(?=\n[📊✅🗣️]|\n\n|$)/i);
  if (nextMatch) {
    const nextLines = nextMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim())
      .map(line => line.replace(/^[\s\-•]+/, '').trim())
      .filter(Boolean);
    if (nextLines.length > 0) {
      metadata.nextSteps = nextLines;
    }
  }

  // Extract errors
  const errorPatterns = [
    /❌\s*(.+?)(?:\n|$)/gi,
    /🚨\s*(.+?)(?:\n|$)/gi,
    /ERROR:\s*(.+?)(?:\n|$)/gi,
  ];
  const errors: string[] = [];
  for (const pattern of errorPatterns) {
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      errors.push(match[1].trim());
    }
  }
  if (errors.length > 0) {
    metadata.errors = errors;
  }

  // Extract warnings
  const warningPatterns = [
    /⚠️\s*(.+?)(?:\n|$)/gi,
    /WARNING:\s*(.+?)(?:\n|$)/gi,
  ];
  const warnings: string[] = [];
  for (const pattern of warningPatterns) {
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      warnings.push(match[1].trim());
    }
  }
  if (warnings.length > 0) {
    metadata.warnings = warnings;
  }

  return metadata;
}

/**
 * Check if a response indicates an error state
 */
export function hasErrorIndicators(text: string): boolean {
  const errorPatterns = [
    /❌/,
    /🚨/,
    /\bERROR\b/i,
    /\bFAILED\b/i,
    /\bEXCEPTION\b/i,
  ];

  return errorPatterns.some(pattern => pattern.test(text));
}

/**
 * Check if a response indicates a warning state
 */
export function hasWarningIndicators(text: string): boolean {
  const warningPatterns = [
    /⚠️/,
    /\bWARNING\b/i,
    /\bCAUTION\b/i,
  ];

  return warningPatterns.some(pattern => pattern.test(text));
}
