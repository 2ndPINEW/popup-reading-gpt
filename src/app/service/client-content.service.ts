import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare const chrome: any;

@Injectable({
  providedIn: 'root',
})
export class ClientContentService {
  content$ = new BehaviorSubject<string | undefined>(undefined);

  constructor(
    private zone: NgZone
  ) {
    // this.content$.next('Welcome to the React documentation! This page will give you an introduction to the 80% of React concepts that you will use on a daily basis.')
    // return
    chrome.tabs.query(
      { active: true, currentWindow: true },
       (tabs: any) => {
        var tabId = tabs[0].id;

        chrome.scripting
          .executeScript({
            target: { tabId: tabId },
            func: () => {
              {
                const results: { content: any; type: string }[] = [];
                function listUpChildNodes(targetNode: any) {
                  targetNode.childNodes.forEach((childNode: HTMLElement) => {
                    if (childNode.tagName?.match(/H[1-6]/)) {
                      results.push({
                        content: childNode.innerText,
                        type: 'heading',
                      });
                    }

                    if (childNode.tagName === 'P') {
                      results.push({
                        content: childNode.innerText,
                        type: 'text',
                      });
                    }

                    if (childNode.tagName === 'UL') {
                      results.push({
                        content: childNode.innerText,
                        type: 'list',
                      });
                    }

                    if (childNode.tagName === 'CODE') {
                      results.push({
                        content: childNode.innerText,
                        type: 'code',
                      });
                    }

                    if (childNode.childNodes.length > 0) {
                      listUpChildNodes(childNode);
                    }
                  });
                }
                listUpChildNodes(document.body);

                const headingIndex = results.findIndex((result) => result.type === "heading");
                const removeResults = results.slice(headingIndex);

                const resultText = removeResults
                  .map((result) => {
                    if (
                      result.type === 'heading' ||
                      result.type === 'text' ||
                      result.type === 'list'
                    ) {
                      return result.content;
                    }
                    if (result.type === 'code') {
                      return `\`\`\`${result.content}\`\`\``;
                    }
                  })
                  .join('\n');
                return resultText;
              }
            },
          })
          .then((injectionResults: any) => {
            this.zone.run(() => {
              this.content$.next(injectionResults[0].result)
            })
          });
      }
    );
  }
}
