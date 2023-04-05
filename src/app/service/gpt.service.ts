// AngularでGPTのAPIを叩くサービス
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable, of, switchMap, tap, timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

export interface GptPostData {
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

declare const chrome: any;

type Status = 'API_KEY_NEED' | 'READY' | 'LOADING'

@Injectable({
  providedIn: 'root',
})
export class GptService {
  status$ = new BehaviorSubject<Status>('LOADING')

  constructor(private api: ApiService) {
    this.checkStatus()
  }

  checkStatus (): void {
    this.getLocalApiKey().subscribe((apiKey) => {
      if (apiKey) {
        this.status$.next('READY')
      } else {
        this.status$.next('API_KEY_NEED')
      }
    })
  }

  getLocalApiKey(): Observable<string> {
    if (!environment.production) {
      return of('')
    }
    return from(chrome.storage.local.get("api-key")).pipe(
      map((result: any) => result['api-key'])
    )
  }

  setLocalApiKey(value: string) {
    if (!environment.production) {
      return of(undefined)
    }
    return from(chrome.storage.local.set({ 'api-key': value })).pipe(
      tap(() => this.status$.next('READY'))
    )
  }

  removeLocalApiKey() {
    if (!environment.production) {
      return of(undefined)
    }
    return from(chrome.storage.local.remove('api-key')).pipe(
      tap(() => this.status$.next('API_KEY_NEED'))
    )
  }

  completions(data: GptPostData): Observable<CompletionsResponse> {
    // 開発中にAPI叩かれると嫌なので、適当なダミーデータを返す
    if (!environment.production) {
      return timer(1000).pipe(
        map(() => ({
          id: 'hoge',
          object: 'chat.completion',
          created: 100,
          model: 'gpt',
          usage: {
            prompt_tokens: 100,
            completion_tokens: 100,
            total_tokens: 100,
          },
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'this is assistant message',
              },
              finish_reason: 'stop',
              index: 0,
            }
          ]
        } as CompletionsResponse))
      )
    }
    return this.getLocalApiKey().pipe(
      switchMap((apiKey) => {
        return this.api.post<CompletionsResponse>('v1/chat/completions', JSON.stringify(data), apiKey).pipe(
          catchError((error) => {
            if (error.error.status === 401) {
              this.removeLocalApiKey()
            }
            throw error
          })
        );
      })
    )
  }
}
