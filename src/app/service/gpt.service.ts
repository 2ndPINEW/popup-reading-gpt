// AngularでGPTのAPIを叩くサービス
import { Injectable } from '@angular/core';
import { map, timer } from 'rxjs';
import { ApiService } from './api.service';

export interface GptOption {
  model: string;
  messages: {
    role: 'system' | 'assistant' | 'user';
    content: string;
  }[];
}

interface CompletionsResponse {
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

@Injectable({
  providedIn: 'root',
})
export class GptService {
  constructor(private api: ApiService) {}

  completions(option: GptOption) {
    // return timer(3000).pipe(
    //   map(() => ({
    //     id: 'hoge',
    //     object: 'chat.completion',
    //     created: 100,
    //     model: 'gpt',
    //     usage: {
    //       prompt_tokens: 100,
    //       completion_tokens: 100,
    //       total_tokens: 100,
    //     },
    //     choices: [
    //       {
    //         message: {
    //           role: 'assistant',
    //           content: 'this is assistant message',
    //         },
    //         finish_reason: 'stop',
    //         index: 0,
    //       }
    //     ]
    //   } as CompletionsResponse))
    // )
    return this.api.post<CompletionsResponse>('v1/chat/completions', JSON.stringify(option));
  }
}
