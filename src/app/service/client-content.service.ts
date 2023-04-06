import { Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { ArticleData, extractFromHtml } from '@extractus/article-extractor';
import { environment } from 'src/environments/environment';

export declare const chrome: any;

@Injectable({
  providedIn: 'root',
})
export class ClientContentService {
  // ページに表示されている記事コンテンツを取得する関数
  getArticle$(): Observable<ArticleData | null> {
    if (!environment.production) {
      // 開発環境ではサンプルデータを返す
      return of({ content: 'This is sample content' });
    }

    // 開いているタブの記事データを返すObservable
    return from(this.getTabInfo()).pipe(
      switchMap(({ tabId, url }) =>
        this.getTabHtml$(tabId).pipe(
          switchMap((html) => this.extractArticleData(html, url))
        )
      )
    );
  }

  // 現在開いているタブの情報を取得する関数
  private async getTabInfo(): Promise<{ tabId: number; url: string }> {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return { tabId: tabs[0].id, url: tabs[0].url };
  }

  // 指定したタブのHTMLを取得する関数
  private getTabHtml$(tabId: number): Observable<string> {
    return from(
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          {
            const html = document.querySelector('html')?.outerHTML;
            return html;
          }
        },
      })
    ).pipe(map((injectionResults: any) => injectionResults[0].result));
  }

  // HTMLから記事データを取得する
  private async extractArticleData(
    html: string,
    url: string
  ): Promise<ArticleData | null> {
    const article = await extractFromHtml(html, url);
    if (article?.content) {
      article.content = article?.content?.replace(/(<[^>]+>|\{[^}]+\})/g, '');
    }
    return article;
  }
}
