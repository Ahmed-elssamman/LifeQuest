import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { AuthStore, authGuard, adminGuard } from '@lifequest/auth';
import { Api, User } from '@lifequest/data-access';
import { sessionInterceptor } from '../../../../libs/auth/src/session-interceptor';
const user: User = {
  id: 'u1',
  email: 'unit@example.test',
  role: 'USER',
  emailVerifiedAt: null,
  createdAt: '2026-09-01',
  profile: {
    displayName: 'Explorer',
    bio: '',
    timezone: 'UTC',
    language: 'en',
    theme: 'light',
    profileVisibility: 'PRIVATE',
    shareChallengeScore: true,
    shareStreak: false,
    notificationsEnabled: true,
    reducedMotion: false,
    preferredRoutine: 'morning',
    onboardingCompletedAt: null,
    avatarUrl: null,
  },
};
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn() }));
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([sessionInterceptor])),
      provideHttpClientTesting(),
      provideRouter([]),
    ],
  });
});
afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
  vi.unstubAllGlobals();
});
describe('Authentication state and navigation', () => {
  it('persists the header language choice and preserves it on session reload', async () => {
    const auth = TestBed.inject(AuthStore);
    auth.setUser(user);
    const pending = auth.changeLanguage();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/profile');
    expect(request.request.body).toEqual({ language: 'ar' });
    request.flush({ language: 'ar' });
    await pending;
    expect(auth.user()?.profile.language).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    auth.setUser({ ...user, profile: { ...user.profile, language: 'ar' } });
    expect(document.documentElement.lang).toBe('ar');
  });
  it('coalesces concurrent session loading', async () => {
    const auth = TestBed.inject(AuthStore);
    const a = auth.load(),
      b = auth.load();
    TestBed.inject(HttpTestingController).expectOne('/api/auth/me').flush(user);
    expect(await a).toEqual(user);
    expect(await b).toEqual(user);
  });
  it('redirects guests and prevents ordinary users entering administration', async () => {
    const route = {} as ActivatedRouteSnapshot,
      state = {} as RouterStateSnapshot;
    const guest = TestBed.runInInjectionContext(() => authGuard(route, state));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/me')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(
      TestBed.inject(Router).serializeUrl((await guest) as ReturnType<Router['createUrlTree']>),
    ).toBe('/auth/login');
    TestBed.inject(AuthStore).setUser(user);
    const denied = await TestBed.runInInjectionContext(() => adminGuard(route, state));
    expect(denied).not.toBe(true);
    TestBed.inject(AuthStore).setUser({ ...user, role: 'ADMIN' });
    expect(await TestBed.runInInjectionContext(() => adminGuard(route, state))).toBe(true);
  });
  it('clears stale sessions when a protected request expires', async () => {
    const auth = TestBed.inject(AuthStore);
    auth.setUser(user);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const pending = TestBed.inject(Api)
      .get('goals')
      .catch((error: unknown) => error);
    TestBed.inject(HttpTestingController)
      .expectOne('/api/goals')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(await pending).toBeInstanceOf(HttpErrorResponse);
    expect(auth.user()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
  });
  it('coalesces only safe reference reads', async () => {
    const api = TestBed.inject(Api);
    const a = api.get('life-areas'),
      b = api.get('life-areas');
    TestBed.inject(HttpTestingController).expectOne('/api/life-areas').flush([]);
    expect(await a).toEqual([]);
    expect(await b).toEqual([]);
    expect(await api.get('life-areas')).toEqual([]);
  });
});
