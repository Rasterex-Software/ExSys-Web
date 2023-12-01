import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiBaseUrl: string = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  public get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const key in params) {
        const value = params[key];
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      }
    }

    return this.httpCall('GET', `${path}${params ? `?${searchParams.toString()}` : ''}`).toPromise();
  }

  public post<T>(path: string, payload?: any): Promise<T> {
    return this.httpCall('POST', path, payload).toPromise();
  }

  public put<T>(path: string, payload?: any): Promise<T> {
    return this.httpCall('PUT', path, payload).toPromise();
  }

  public patch<T>(path: string, payload?: any): Promise<T> {
    return this.httpCall('PATCH', path, payload).toPromise();
  }

  public delete<T>(path: string, payload?: any): Promise<T> {
    return this.httpCall('DELETE', path, payload).toPromise();
  }

  public postFile<T>(path: string, file: File): Promise<ArrayBuffer> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpCall('POST', path, formData, { responseType: 'arraybuffer' }, "multipart/form-data; charset=utf-8").toPromise();
  }

  private httpCall(method: string, path: string, payload?: any, options?: any, contentType = 'application/json'): Observable<any> {
    const headers = new HttpHeaders();

    if (contentType !== null) {
      headers.append('Content-Type', contentType);
    }

    return this.http.request(method, `${this.apiBaseUrl}${path}`, { headers, body: payload, ...options });
  }
}