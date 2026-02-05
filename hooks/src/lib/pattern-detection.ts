/**
 * Pattern Detection Utility
 *
 * Detects when 3+ learnings share similar characteristics, triggering a pattern
 * candidate for rule compilation. Uses domain+tag matching (not ML embeddings)
 * for transparent, debuggable pattern detection.
 *
 * Used by: /pai learn command, WorkCompletionLearning hook
 */

import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

// ============================================================================
// Interfaces
// ============================================================================

export interface Learning {
  id: string;              // filename without extension
  date: string;            // YYYY-MM-DD
  domain: string;          // from frontmatter
  tags: string[];          // from frontmatter
  confidence: string;      // HIGH|MEDIUM|LOW
  filepath: string;        // full path
}

export interface PatternMatch {
  patternId: string;       // {domain}-{primary-tag}
  learnings: Learning[];   // matched learnings (3+)
  matchScore: number;      // total tag overlap score
  detectedAt: string;      // ISO timestamp
}

export interface PatternIndexEntry {
  domain: string;
  primaryTags: string[];
  learningIds: string[];
  detectedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface PatternIndex {
  patterns: {
    [patternId: string]: PatternIndexEntry;
  };
  lastUpdated: string;
}

// ============================================================================
// Constants
// ============================================================================

const PATTERN_THRESHOLD = 3;     // minimum learnings for pattern
const TAG_OVERLAP_REQUIRED = 2;  // minimum tag matches

// ============================================================================
// Frontmatter Parsing
// ============================================================================

/**
 * Extract YAML frontmatter from learning file content
 * Handles missing fields gracefully (returns empty tags, 'general' domain)
 */
export function parseLearningFrontmatter(content: string): Partial<Learning> {
  const result: Partial<Learning> = {
    domain: 'general',
    tags: [],
    confidence: 'MEDIUM',
    date: '',
  };

  // Check for frontmatter delimiters
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return result;
  }

  const frontmatter = frontmatterMatch[1];

  // Parse domain
  const domainMatch = frontmatter.match(/^domain:\s*(.+)$/m);
  if (domainMatch) {
    result.domain = domainMatch[1].trim();
  }

  // Parse date
  const dateMatch = frontmatter.match(/^date:\s*(.+)$/m);
  if (dateMatch) {
    result.date = dateMatch[1].trim();
  }

  // Parse confidence
  const confidenceMatch = frontmatter.match(/^confidence:\s*(.+)$/m);
  if (confidenceMatch) {
    result.confidence = confidenceMatch[1].trim().toUpperCase();
  }

  // Parse tags (can be YAML array or comma-separated)
  const tagsSection = frontmatter.match(/^tags:\s*\n((?:\s+-\s*.+\n?)+)/m);
  if (tagsSection) {
    // YAML array format
    const tagLines = tagsSection[1].match(/^\s+-\s*(.+)$/gm);
    if (tagLines) {
      result.tags = tagLines.map(line => line.replace(/^\s+-\s*/, '').trim());
    }
  } else {
    // Inline format: tags: [tag1, tag2] or tags: tag1, tag2
    const inlineTagsMatch = frontmatter.match(/^tags:\s*\[?([^\]\n]+)\]?$/m);
    if (inlineTagsMatch) {
      result.tags = inlineTagsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  return result;
}

// ============================================================================
// Learning Scanning
// ============================================================================

/**
 * Recursively scan learnings directory
 * Parse each .md file for frontmatter
 * Return array of Learning objects
 */
export function scanLearnings(learningsDir: string): Learning[] {
  const learnings: Learning[] = [];

  if (!existsSync(learningsDir)) {
    return learnings;
  }

  function scanDirectory(dir: string): void {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip archived and special directories
        if (entry !== 'archived' && !entry.startsWith('.')) {
          scanDirectory(fullPath);
        }
      } else if (entry.endsWith('.md') && entry !== 'index.md') {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const parsed = parseLearningFrontmatter(content);

          // Extract date from filename if not in frontmatter
          const fileDate = entry.match(/^(\d{4}-\d{2}-\d{2})/);
          const date = parsed.date || (fileDate ? fileDate[1] : '');

          // Infer domain from directory if not in frontmatter
          const parentDir = basename(join(fullPath, '..'));
          const domain = parsed.domain !== 'general' ? parsed.domain :
            (parentDir !== 'learnings' ? parentDir : 'general');

          const learning: Learning = {
            id: entry.replace(/\.md$/, ''),
            date,
            domain,
            tags: parsed.tags || [],
            confidence: parsed.confidence || 'MEDIUM',
            filepath: fullPath,
          };

          learnings.push(learning);
        } catch (err) {
          // Skip files that can't be read
          console.error(`Warning: Could not parse learning file ${fullPath}`);
        }
      }
    }
  }

  scanDirectory(learningsDir);
  return learnings;
}

// ============================================================================
// Pattern Detection
// ============================================================================

/**
 * Count tags present in both arrays
 */
export function countTagOverlap(tags1: string[], tags2: string[]): number {
  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  let count = 0;

  for (const tag of tags2) {
    if (set1.has(tag.toLowerCase())) {
      count++;
    }
  }

  return count;
}

/**
 * Detect patterns by finding similar learnings
 *
 * Algorithm:
 * 1. Filter to same domain
 * 2. Score by tag overlap
 * 3. Require TAG_OVERLAP_REQUIRED minimum
 * 4. If PATTERN_THRESHOLD-1 matches exist, return PatternMatch
 * 5. Return null if threshold not met
 */
export function detectPatterns(
  newLearning: Learning,
  existingLearnings: Learning[]
): PatternMatch | null {
  // Filter to same domain
  const sameDomain = existingLearnings.filter(l =>
    l.domain.toLowerCase() === newLearning.domain.toLowerCase() &&
    l.id !== newLearning.id
  );

  if (sameDomain.length < PATTERN_THRESHOLD - 1) {
    return null;  // Not enough learnings in this domain
  }

  // Score each learning by tag overlap
  const scored = sameDomain
    .map(learning => ({
      learning,
      overlap: countTagOverlap(newLearning.tags, learning.tags),
    }))
    .filter(item => item.overlap >= TAG_OVERLAP_REQUIRED)
    .sort((a, b) => b.overlap - a.overlap);

  // Need THRESHOLD-1 matches (plus the new learning makes THRESHOLD)
  if (scored.length < PATTERN_THRESHOLD - 1) {
    return null;
  }

  // Take top matches
  const matchedLearnings = scored.slice(0, PATTERN_THRESHOLD - 1).map(s => s.learning);
  const allLearnings = [newLearning, ...matchedLearnings];

  // Calculate total match score
  const totalScore = scored.slice(0, PATTERN_THRESHOLD - 1).reduce((sum, s) => sum + s.overlap, 0);

  // Generate pattern ID from domain and most common tag
  const tagCounts: Record<string, number> = {};
  for (const learning of allLearnings) {
    for (const tag of learning.tags) {
      const normalizedTag = tag.toLowerCase();
      tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
    }
  }

  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([tag]) => tag);

  const primaryTag = sortedTags[0] || 'general';
  const patternId = `${newLearning.domain.toLowerCase()}-${primaryTag.replace(/\s+/g, '-')}`;

  return {
    patternId,
    learnings: allLearnings,
    matchScore: totalScore,
    detectedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Pattern Index Management
// ============================================================================

/**
 * Load pattern index or return default empty structure
 */
export function loadPatternIndex(patternsDir: string): PatternIndex {
  const indexPath = join(patternsDir, 'index.json');

  if (!existsSync(indexPath)) {
    return {
      patterns: {},
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const content = readFileSync(indexPath, 'utf-8');
    return JSON.parse(content) as PatternIndex;
  } catch (err) {
    console.error('Warning: Could not parse pattern index, returning empty');
    return {
      patterns: {},
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Update pattern index with new match
 *
 * Rules:
 * - If pattern exists and status is 'rejected', do NOT update (already reviewed)
 * - If new, add to patterns with status 'pending'
 */
export function updatePatternIndex(patternsDir: string, match: PatternMatch): void {
  const index = loadPatternIndex(patternsDir);

  // Check if pattern already exists
  if (index.patterns[match.patternId]) {
    const existing = index.patterns[match.patternId];

    // Don't update rejected patterns - they've been reviewed
    if (existing.status === 'rejected') {
      return;
    }

    // Update existing pending/approved pattern with new learnings
    const existingIds = new Set(existing.learningIds);
    for (const learning of match.learnings) {
      if (!existingIds.has(learning.id)) {
        existing.learningIds.push(learning.id);
      }
    }
    existing.detectedAt = match.detectedAt;
  } else {
    // Add new pattern
    const primaryTags = [...new Set(
      match.learnings.flatMap(l => l.tags)
    )].slice(0, 5);

    index.patterns[match.patternId] = {
      domain: match.learnings[0].domain,
      primaryTags,
      learningIds: match.learnings.map(l => l.id),
      detectedAt: match.detectedAt,
      status: 'pending',
    };
  }

  index.lastUpdated = new Date().toISOString();

  // Write updated index
  const indexPath = join(patternsDir, 'index.json');
  writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf-8');
}

/**
 * Quick check if pattern needs review
 */
export function isPatternPending(patternsDir: string, patternId: string): boolean {
  const index = loadPatternIndex(patternsDir);
  const pattern = index.patterns[patternId];
  return pattern?.status === 'pending';
}

// ============================================================================
// Exports
// ============================================================================

export {
  PATTERN_THRESHOLD,
  TAG_OVERLAP_REQUIRED,
};
