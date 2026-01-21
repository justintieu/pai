/**
 * IdealState.ts - Ideal state configuration types and utilities
 *
 * Defines what "done" looks like for various PAI operations.
 */

export interface IdealStateCriteria {
  description: string;
  verifiable: boolean;
  metrics?: string[];
}

export interface IdealState {
  id: string;
  title: string;
  criteria: IdealStateCriteria[];
  created_at: string;
  updated_at?: string;
}

/**
 * Default ideal state for general tasks
 */
export const DEFAULT_IDEAL_STATE: IdealState = {
  id: 'default',
  title: 'Task Completion',
  criteria: [
    {
      description: 'Task completed as requested',
      verifiable: true,
    },
    {
      description: 'No errors or warnings',
      verifiable: true,
    },
    {
      description: 'User notified of completion',
      verifiable: true,
    },
  ],
  created_at: new Date().toISOString(),
};

/**
 * Check if an ideal state has been met
 */
export function checkIdealState(
  state: IdealState,
  results: Record<string, boolean>
): { met: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const criterion of state.criteria) {
    const key = criterion.description;
    if (criterion.verifiable && !results[key]) {
      missing.push(key);
    }
  }

  return {
    met: missing.length === 0,
    missing,
  };
}
