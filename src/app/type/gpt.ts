export interface GptPostData {
  model: string;
  messages: {
    role: 'system' | 'assistant' | 'user';
    content: string;
  }[];
}

export interface CompletionsResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: [
    {
      message: {
        role: 'assistant';
        content: string;
      };
      finish_reason: 'stop';
      index: number;
    }
  ];
}

export type GptStatus = 'API_KEY_NEED' | 'READY' | 'LOADING'
