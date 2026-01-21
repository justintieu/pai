#!/usr/bin/env bun
/**
 * CheckVersion.hook.ts - Check for Claude Code Updates (SessionStart)
 *
 * PURPOSE:
 * Checks if there's a newer version of Claude Code available and notifies
 * the user if an update is available. Runs silently if already up to date.
 *
 * TRIGGER: SessionStart
 *
 * OUTPUT:
 * - stdout: Update notice if newer version available
 * - stderr: Status messages
 * - exit(0): Always (non-blocking)
 */

async function checkForUpdates(): Promise<void> {
  try {
    // Get installed version
    const installedProc = Bun.spawn(['claude', '--version'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const installedOutput = await new Response(installedProc.stdout).text();
    const installedVersion = installedOutput.trim().match(/\d+\.\d+\.\d+/)?.[0];

    if (!installedVersion) {
      console.error('[CheckVersion] Could not determine installed version');
      return;
    }

    // Check npm for latest version
    const npmProc = Bun.spawn(['npm', 'view', '@anthropic-ai/claude-code', 'version'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const npmOutput = await new Response(npmProc.stdout).text();
    const latestVersion = npmOutput.trim();

    if (!latestVersion) {
      console.error('[CheckVersion] Could not check latest version');
      return;
    }

    // Compare versions
    if (installedVersion !== latestVersion) {
      console.log(`\n📦 Claude Code update available: ${installedVersion} → ${latestVersion}`);
      console.log('   Run: npm update -g @anthropic-ai/claude-code\n');
    } else {
      console.error(`[CheckVersion] Claude Code is up to date (${installedVersion})`);
    }
  } catch (error) {
    // Silently ignore errors - this is a non-critical check
    console.error('[CheckVersion] Version check skipped:', error);
  }
}

// Check if this is a subagent session
const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
const isSubagent = claudeProjectDir.includes('/.claude/Agents/') ||
                  process.env.CLAUDE_AGENT_TYPE !== undefined;

if (!isSubagent) {
  checkForUpdates().then(() => process.exit(0));
} else {
  process.exit(0);
}
