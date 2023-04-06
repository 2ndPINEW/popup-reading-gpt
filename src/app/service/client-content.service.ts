import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { ArticleData, extractFromHtml } from '@extractus/article-extractor';
import { environment } from 'src/environments/environment';

export declare const chrome: any;

/** クライアントページに表示されているコンテンツを取得するサービス */
@Injectable({
  providedIn: 'root',
})
export class ClientContentService {
  /**
   * ページに表示されている記事コンテンツを取得する関数
   */
  getArticle$(): Observable<ArticleData | null> {
    // 開発環境ではサンプルデータを返す
    if (!environment.production) {
      return of({ content: 'This is sample content' });
    }
    // 記事データを返すObservable
    return from(
      new Promise<ArticleData | null>(async (res) => {
        // 現在開いているタブの情報を取得
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const { id, url } = tabs[0];

        // 開いているタブでHTMLを返す関数を実行する
        const injectionResults = await chrome.scripting.executeScript({
          target: { tabId: id },
          func: () => {
            {
              const html = document.querySelector('html')?.outerHTML;
              return html;
            }
          },
        });
        // 実行結果からHTMLを取得する
        const html = injectionResults[0].result;
        // HTMLから記事データを取得する
        const article = await extractFromHtml(html, url);
        // 記事データの本文に含まれるHTMLタグを除去する
        if (article?.content) {
          article.content = article?.content?.replace(
            /(<[^>]+>|\{[^}]+\})/g,
            ''
          );
        }
        // 記事データを返す
        res(article);
      })
    );
  }
}
