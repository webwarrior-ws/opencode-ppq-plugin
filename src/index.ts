/**
 * 
 */

import type { Plugin } from '@opencode-ai/plugin';
import path from 'path';

export const PPQPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  await client.app.log({
    body: {
      service: "ppq-plugin",
      level: "info",
      message: "PPQ.ai plugin loaded"
    },
  });

  return {
    // ============================================================
    // CONFIG HOOK
    // Modify config at runtime - use this to inject custom commands
    // ============================================================
    async config(config) {
      // Initialize the providers dictionary if it doesn't exist
      config.provider = config.provider ?? {};

      // TODO: Add PPQ.ai provider
    },
  };
};
