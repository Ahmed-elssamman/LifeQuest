import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Api, Remote, errorMessage, Celebrations } from '@lifequest/data-access';
import { beforeEach, describe, expect, it } from 'vitest';

describe('HTTP state and race handling', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  it('attaches credentials and supplies resource loading/success state', async () => {
    const api = TestBed.inject(Api);
    const remote = new Remote<{ title: string }>(api, 'goals');
    const pending = remote.load();
    expect(remote.loading()).toBe(true);
    const request = TestBed.inject(HttpTestingController).expectOne('/api/goals');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ title: 'Grow' });
    await pending;
    expect(remote.data()?.title).toBe('Grow');
    expect(remote.loading()).toBe(false);
  });
  it('ignores stale requests when filtering changes quickly', async () => {
    const remote = new Remote<string[]>(TestBed.inject(Api), 'habits');
    const first = remote.load();
    const second = remote.load('habits?areaId=mind');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/habits?areaId=mind').flush(['Read']);
    await second;
    http.expectOne('/api/habits').flush(['Walk']);
    await first;
    expect(remote.data()).toEqual(['Read']);
  });
  it('preserves successful data on errors and supports retry', async () => {
    const remote = new Remote<string[]>(TestBed.inject(Api), 'goals');
    const http = TestBed.inject(HttpTestingController);
    let pending = remote.load();
    http.expectOne('/api/goals').flush(['Goal']);
    await pending;
    pending = remote.load();
    http
      .expectOne('/api/goals')
      .flush({ message: 'Try again later.' }, { status: 503, statusText: 'Unavailable' });
    await pending;
    expect(remote.error()).toBe('Try again later.');
    expect(remote.data()).toEqual(['Goal']);
    pending = remote.load();
    http.expectOne('/api/goals').flush([]);
    await pending;
    expect(remote.error()).toBe('');
    expect(remote.data()).toEqual([]);
  });
  it('maps network and unexpected errors to safe messages', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('offline');
    expect(errorMessage(new Error('private stack trace'))).not.toContain('private');
  });
  it('explains Arabic network and authorization errors without exposing internals', () => {
    const language = document.documentElement.lang;
    document.documentElement.lang = 'ar';
    try {
      expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('غير متصل');
      expect(errorMessage(new HttpErrorResponse({ status: 403 }))).toContain('غير متاح');
      expect(errorMessage(new Error('private detail'))).not.toContain('private');
    } finally {
      document.documentElement.lang = language;
    }
  });
  it('shows only server-reported level transitions and keeps duplicate actions quiet', async () => {
    const api = TestBed.inject(Api);
    const celebrations = TestBed.inject(Celebrations);
    const http = TestBed.inject(HttpTestingController);
    const complete = api.post('habits/example/complete');
    http
      .expectOne('/api/habits/example/complete')
      .flush({ awarded: 30, levelUp: { number: 2, title: 'Finding rhythm', titleAr: 'مستمر' } });
    await complete;
    expect(celebrations.level()?.number).toBe(2);
    celebrations.dismiss();
    const duplicate = api.post('habits/example/complete');
    http.expectOne('/api/habits/example/complete').flush({ awarded: 0, duplicate: true });
    await duplicate;
    expect(celebrations.level()).toBeNull();
  });
});
