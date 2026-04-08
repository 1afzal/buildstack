import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export default class GoogleProvider extends BaseProvider {
  name = 'Google';
  getApiKeyLink = 'https://aistudio.google.com/app/apikey';

  config = {
    apiTokenKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'gemini-2.5-flash',
      label: 'Gemini 2.5 Flash',
      provider: 'Google',
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 65536,
    },
    {
      name: 'gemini-2.5-pro',
      label: 'Gemini 2.5 Pro',
      provider: 'Google',
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 65536,
    },
  ];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
    });

    if (!apiKey) {
      throw `Missing Api Key configuration for ${this.name} provider`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      headers: {
        ['Content-Type']: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models from Google API: ${response.status} ${response.statusText}`);
    }

    const res = (await response.json()) as any;

    if (!res.models || !Array.isArray(res.models)) {
      throw new Error('Invalid response format from Google API');
    }

    // Only allow Gemini 2.5+ text generation models
    const data = res.models.filter((model: any) => {
      const name = model.name || '';
      const isGemini25 = name.includes('gemini-2.5');
      const isTextModel =
        !name.includes('tts') && !name.includes('image') && !name.includes('audio') && !name.includes('computer-use');
      const hasGoodTokenLimit = (model.outputTokenLimit || 0) > 8000;

      return isGemini25 && isTextModel && hasGoodTokenLimit;
    });

    return data.map((m: any) => {
      const modelName = m.name.replace('models/', '');

      // Get accurate context window from Google API
      let contextWindow = 32000; // default fallback

      if (m.inputTokenLimit && m.outputTokenLimit) {
        // Use the input limit as the primary context window (typically larger)
        contextWindow = m.inputTokenLimit;
      } else if (modelName.includes('gemini-2.5') || modelName.includes('gemini-2.0')) {
        contextWindow = 1000000;
      }

      // Cap at reasonable limits to prevent issues
      const maxAllowed = 2000000; // 2M tokens max
      const finalContext = Math.min(contextWindow, maxAllowed);

      // Get completion token limit from Google API
      let completionTokens = 65536; // default fallback

      if (m.outputTokenLimit && m.outputTokenLimit > 0) {
        completionTokens = Math.min(m.outputTokenLimit, 128000); // Use API value, cap at reasonable limit
      }

      return {
        name: modelName,
        label: `${m.displayName} (${finalContext >= 1000000 ? Math.floor(finalContext / 1000000) + 'M' : Math.floor(finalContext / 1000) + 'k'} context)`,
        provider: this.name,
        maxTokenAllowed: finalContext,
        maxCompletionTokens: completionTokens,
      };
    });
  }

  getModelInstance(options: {
    model: string;
    serverEnv: any;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    return google(model);
  }
}
