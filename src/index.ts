/**
 * 
 */

import type { Plugin } from '@opencode-ai/plugin';
import path from 'path';

interface PPQPricing {
	input_per_1M_tokens: number;
	output_per_1M_tokens: number;
}

interface PPQModel {
	id: string;
	name: string;
	context_length: number;
	pricing: PPQPricing;
}

interface PPQApiResponse {
	data: PPQModel[];
}

async function fetchPPQModels() {
	try {
		//console.log("Fetching models from PPQ.ai...");
		const response = await fetch("https://api.ppq.ai/v1/models");
		const data = (await response.json()) as PPQApiResponse;

		const models : { [key: string]: any } = {};

		for (const model of data.data) {
			models[model.id] = {
				id: model.id,
				name: model.name,
				cost: {
					input: model.pricing.input_per_1M_tokens,
					output: model.pricing.output_per_1M_tokens
				},
        limit: {
            context: model.context_length,
            output: 4096 // ?
        }
        // modalities?
			};
		}

		//console.log(`Fetched ${models.length} models from PPQ.ai`);
		return models;
	} catch (error) {
		//console.error("Failed to fetch PPQ.ai models:", error);
		return {};
	}
}

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

      const modelsCacheFilePath = path.join(directory, ".opencode", "ppq-models-chache.json");

      const models = await fetchPPQModels();

      await client.app.log({
        body: {
          service: "ppq-plugin",
          level: "info",
          message: `${Object.keys(models).length} PPQ.ai models fetched`
        },
      });

      const apiKey = process.env.PPQ_API_KEY;
      config.provider["ppq"] = {
        npm: "@ai-sdk/openai-compatible",
        name: "PPQ.ai",
        options: {
          baseURL: "https://api.ppq.ai",
          apiKey: apiKey
        },
        models: models
      };
    },
  };
};
