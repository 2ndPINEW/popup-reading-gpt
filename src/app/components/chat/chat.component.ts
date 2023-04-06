import { Component } from '@angular/core';
import { ClientContentService } from 'src/app/service/client-content.service';
import { GptService } from 'src/app/service/gpt.service';
import { GptMessage, GptPostData } from 'src/app/type/gpt';

/**
 * 開いている記事についてチャットするためのコンポーネント
 */
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  /** 画面に表示するチャットの履歴、人が読みやすいように加工したデータが入る */
  chatHistory: { role: string; content: string }[] = [];

  /** APIにポストするデータ */
  private messages: GptMessage[] = [];

  isFetching = false;

  constructor(
    private clientContentService: ClientContentService,
    private gpt: GptService
  ) {}

  ngOnInit() {
    this.clientContentService.getArticle$().subscribe(
      (article) => {
        if (article && article.content) {
          this.initMessages(article.content);
          this.fetchCompletions();
        }
      },
      (error) => {
        console.log(error);
        this.chatHistory.push({
          role: 'error',
          content: 'Error occurred. Cannot read article.',
        });
      }
    );
  }

  private initMessages(articleContent: string) {
    this.messages = [
      {
        role: 'system',
        content:
          'あなたは優秀なアシスタントです、以下の文章の内容をよく読んで、要点を要約してください。また日本語で回答してください。ユーザーからの質問に回答する際は、文章内にある情報が有用な場合、文章内の情報を優先して利用してください',
      },
      {
        role: 'system',
        content: articleContent,
      },
    ];
  }

  private addChatHistory(message: GptPostData['messages'][0]) {
    const copyMessage = JSON.parse(
      JSON.stringify(message)
    ) as GptPostData['messages'][0];
    copyMessage.content = copyMessage.content
      .replaceAll('\n', '<br>')
      .replaceAll('```', '')
      .replaceAll('。', '。<br>');
    this.chatHistory.push(copyMessage);
  }

  /** ユーザーが入力したメッセージを送信する */
  submitChat(content: string) {
    if (this.isFetching) return;
    const message = {
      role: 'user',
      content,
    } as GptPostData['messages'][0];
    this.messages.push(message);
    this.addChatHistory(message);

    this.fetchCompletions();
  }

  private fetchCompletions() {
    this.isFetching = true;
    this.gpt.completions(this.messages).subscribe(
      (content) => {
        this.messages.push(content.choices[0].message);
        this.addChatHistory(content.choices[0].message);
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
