import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ClientContentService } from './service/client-content.service';
import { GptOption, GptService } from './service/gpt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  /** チャットの履歴 */
  chatHistory: { role: string; content: string }[] = [];

  /** チャットの入力欄 */
  chatInput = new FormControl('');

  /** APIにポストするデータ */
  private data: GptOption = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'あなたは優秀なアシスタントです、以下の文章の内容をよく読んで、要点を要約してください。また日本語で回答してください。ユーザーからの質問に回答する際は、文章内にある情報が有用な場合、文章内の情報を優先して利用してください',
      },
    ],
  };

  isFetching = false;

  constructor(
    private clientContentService: ClientContentService,
    private gpt: GptService
  ) {}

  ngOnInit() {
    this.clientContentService.content$.subscribe((content) => {
      if (content) {
        this.data.messages.push({
          role: 'system',
          content: content,
        });
        this.fetchCompletions(this.data);
      }
    });
  }

  private pressKeys: string[] = [];
  keyUp(e: KeyboardEvent) {
    this.pressKeys = this.pressKeys.filter((key) => key !== e.key);
  }
  keyDown(e: KeyboardEvent) {
    this.pressKeys.push(e.key);
    if (
      e.key === 'Enter' &&
      (this.pressKeys.includes('Control') || this.pressKeys.includes('Meta'))
    ) {
      this.sendChant();
    }
  }

  sendChant() {
    if (!this.chatInput.value || this.isFetching) return;
    const message = {
      role: 'user',
      content: this.chatInput.value,
    } as GptOption['messages'][0];
    this.data.messages.push(message);
    this.chatHistory.push(message);
    this.chatInput.setValue('');

    this.fetchCompletions(this.data);
  }

  private fetchCompletions(data: GptOption) {
    this.isFetching = true;
    this.gpt.completions(data).subscribe(
      (content) => {
        this.data.messages.push(content.choices[0].message);
        this.chatHistory.push(content.choices[0].message);
        this.isFetching = false;
      },
      (error) => {
        console.log(error);
        this.chatHistory.push({
          role: 'error',
          content: error.error.error.message,
        });
        this.isFetching = false;
      }
    );
  }
}
