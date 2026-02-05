/**
 * rate-limit.ts - GitHub API rate limit checking for investigations
 *
 * Guards all investigation operations by checking rate limits before execution.
 * Uses `gh api rate_limit` via Bun.shell for zero new dependencies.
 */

/**
 * Rate limit status returned by checkRateLimit()
 */
export interface RateLimitStatus {
  /** Number of API calls remaining in current window */
  remaining: number;
  /** Total API call limit per window */
  limit: number;
  /** Unix timestamp when rate limit resets */
  resetTime: number;
  /** Human-readable reset time (e.g., "10:30:45 AM") */
  resetTimeFormatted: string;
  /** Whether there are sufficient calls remaining (>= minRequired) */
  sufficient: boolean;
  /** Conservative per-repo budget: Math.floor(remaining / 10) */
  budgetPerRepo: number;
  /** Error message if rate limit check failed */
  error?: string;
}

/**
 * Default minimum required API calls to start an investigation.
 * Research recommendation: 50 (1% of 5000 hourly limit)
 */
const DEFAULT_MIN_REQUIRED = 50;

/**
 * Check current GitHub API rate limit status.
 *
 * @param minRequired - Minimum calls required to proceed (default: 50)
 * @returns RateLimitStatus with current limits and sufficiency check
 *
 * @example
 * const status = await checkRateLimit();
 * if (!status.sufficient) {
 *   console.log(`Rate limit too low. Resets at ${status.resetTimeFormatted}`);
 *   return;
 * }
 */
export async function checkRateLimit(
  minRequired: number = DEFAULT_MIN_REQUIRED
): Promise<RateLimitStatus> {
  try {
    // Check if gh CLI is available
    const whichResult = await Bun.$`which gh`.quiet();
    if (whichResult.exitCode !== 0) {
      return createErrorStatus("gh CLI not installed. Install from https://cli.github.com/");
    }

    // Check authentication status
    const authResult = await Bun.$`gh auth status`.quiet();
    if (authResult.exitCode !== 0) {
      return createErrorStatus("gh CLI not authenticated. Run 'gh auth login' first.");
    }

    // Get rate limit info using gh api
    const result = await Bun.$`gh api rate_limit --jq '.resources.core | {remaining: .remaining, limit: .limit, reset: .reset}'`.quiet();

    if (result.exitCode !== 0) {
      const stderr = result.stderr.toString().trim();
      return createErrorStatus(`Failed to fetch rate limit: ${stderr}`);
    }

    const output = result.stdout.toString().trim();
    const data = JSON.parse(output);

    const remaining = data.remaining;
    const limit = data.limit;
    const resetTime = data.reset;

    // Format reset time for human readability
    const resetDate = new Date(resetTime * 1000);
    const resetTimeFormatted = resetDate.toLocaleTimeString();

    // Calculate sufficiency and budget
    const sufficient = remaining >= minRequired;
    const budgetPerRepo = Math.floor(remaining / 10);

    return {
      remaining,
      limit,
      resetTime,
      resetTimeFormatted,
      sufficient,
      budgetPerRepo,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return createErrorStatus(`Rate limit check failed: ${message}`);
  }
}

/**
 * Create an error status object with default values.
 */
function createErrorStatus(error: string): RateLimitStatus {
  return {
    remaining: 0,
    limit: 0,
    resetTime: 0,
    resetTimeFormatted: "Unknown",
    sufficient: false,
    budgetPerRepo: 0,
    error,
  };
}

/**
 * Format a user-friendly message about rate limit status.
 *
 * @param status - RateLimitStatus from checkRateLimit()
 * @returns Human-readable message suitable for display
 *
 * @example
 * const status = await checkRateLimit();
 * console.log(formatRateLimitMessage(status));
 * // "Rate limit OK: 4950/5000 remaining (budget: 495 per repo)"
 * // or
 * // "Rate limit LOW: 30/5000 remaining. Resets at 10:30:45 AM"
 */
export function formatRateLimitMessage(status: RateLimitStatus): string {
  if (status.error) {
    return `Rate limit error: ${status.error}`;
  }

  const percentUsed = ((status.limit - status.remaining) / status.limit * 100).toFixed(1);

  if (status.sufficient) {
    return `Rate limit OK: ${status.remaining}/${status.limit} remaining (${percentUsed}% used, budget: ${status.budgetPerRepo} per repo)`;
  } else {
    return `Rate limit LOW: ${status.remaining}/${status.limit} remaining (${percentUsed}% used). Resets at ${status.resetTimeFormatted}. Investigation blocked.`;
  }
}

// Allow running directly for testing
if (import.meta.main) {
  const status = await checkRateLimit();
  console.log(formatRateLimitMessage(status));
  console.log("\nFull status:", JSON.stringify(status, null, 2));
}
