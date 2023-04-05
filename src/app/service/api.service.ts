import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private headers(apiKey: string): any {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    });
  }

  private isApiError(res: any) {
    return 'error' in res;
  }

  post<T>(path: string, body: string, apiKey: string) {
    const url = 'https://api.openai.com/' + path;
    const httpOptions: any = {
      headers: this.headers(apiKey),
      observe: 'response',
    };
    return this.http
      .post<T>(url, body, httpOptions)
      .pipe(map((v) => (v as any).body))
      .pipe(
        tap((v) => {
          if (this.isApiError(v)) {
            throw v;
          }
        })
      ) as unknown as Observable<T>;
  }
}
