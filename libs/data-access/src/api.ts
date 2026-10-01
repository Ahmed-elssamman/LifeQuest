import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { errorMessage } from './errors';
export { errorMessage } from './errors';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Celebrations } from './celebrations';
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly celebrations = inject(Celebrations);
  private readonly publicReads = new Map<string, { expires: number; value: Promise<unknown> }>();
  get<T>(path: string) {
    if (path !== 'life-areas')
      return firstValueFrom(this.http.get<T>(`/api/${path}`, { withCredentials: true }));
    const cached = this.publicReads.get(path);
    if (cached && cached.expires > Date.now()) return cached.value as Promise<T>;
    const value = firstValueFrom(this.http.get<T>(`/api/${path}`, { withCredentials: true })).catch(
      (error) => {
        this.publicReads.delete(path);
        throw error;
      },
    );
    this.publicReads.set(path, { expires: Date.now() + 300000, value });
    return value;
  }
  post<T>(path: string, body: unknown = {}) {
    return firstValueFrom(this.http.post<T>(`/api/${path}`, body, { withCredentials: true })).then(
      (result) => {
        this.celebrations.receive(result);
        return result;
      },
    );
  }
  patch<T>(path: string, body: unknown) {
    return firstValueFrom(this.http.patch<T>(`/api/${path}`, body, { withCredentials: true })).then(
      (result) => {
        this.celebrations.receive(result);
        return result;
      },
    );
  }
  resource<T>(path: string) {
    const resource = new Remote<T>(this, path);
    void resource.load();
    return resource;
  }
}
export class Remote<T> {
  readonly data = signal<T | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  private request = 0;
  constructor(
    private readonly api: Api,
    private path: string,
  ) {}
  async load(path = this.path) {
    const request = ++this.request;
    this.path = path;
    this.loading.set(true);
    this.error.set('');
    try {
      const data = await this.api.get<T>(path);
      if (request === this.request) this.data.set(data);
    } catch (error) {
      if (request === this.request) this.error.set(errorMessage(error));
    } finally {
      if (request === this.request) this.loading.set(false);
    }
  }
}
@Injectable({ providedIn: 'root' })
export class Toasts {
  private readonly messages = inject(MessageService);
  success(summary: string, detail?: string) {
    this.messages.add({ severity: 'success', summary, detail, life: 3500 });
  }
  error(error: unknown) {
    this.messages.add({ severity: 'error', summary: errorMessage(error), life: 6000 });
  }
}
