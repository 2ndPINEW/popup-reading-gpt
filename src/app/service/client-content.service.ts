import { Injectable, NgZone } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { ArticleData, extractFromHtml } from '@extractus/article-extractor'
import { environment } from 'src/environments/environment';

declare const chrome: any;

/** クライアントページに表示されているコンテンツを取得するサービス */
@Injectable({
  providedIn: 'root',
})
export class ClientContentService {
  constructor(
    private zone: NgZone
  ) {}

  getArticle$ (): Observable<ArticleData | null> {
    if (!environment.production) {
      return of({ content: 'This is sample content' })
    }
    const subject$ = new Subject<ArticleData | null>()
    new Promise(async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tabId = tabs[0].id;
      const url = tabs[0].url;

      const injectionResults = await chrome.scripting
        .executeScript({
          target: { tabId: tabId },
          func: () => {
            {
              const html = document.querySelector('html')?.outerHTML
              return html;
            }
          },
        })
      const html = injectionResults[0].result
      const article = await extractFromHtml(html, url)
      if (article?.content) {
        article.content = article?.content?.replace(/(<[^>]+>|\{[^}]+\})/g, '')
      }
      this.zone.run(() => {
        subject$.next(article)
        subject$.complete()
      })
    }).catch((e) => {
      subject$.error(e)
      subject$.complete()
    })
    return subject$
  }
}
