import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ApiOptions {
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient
  ) { }

  private httpOptions: any = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }),
    observe: 'response'
  }

  isApiError (res: any) {
    return 'error' in res
  }

  post<T>(path: string, body: string) {
    const url = 'https://api.openai.com/' + path
    return this.http.post<T>(url, body, this.httpOptions)
      .pipe(
        map(v => (v as any).body)
      )
      .pipe(
        tap(v => {
          if (this.isApiError(v)) {
            throw v
          }
        })
      ) as unknown as Observable<T>
  }
}
