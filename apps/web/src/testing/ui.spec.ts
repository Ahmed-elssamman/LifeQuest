import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState, Progress, Skeleton } from '@lifequest/ui';
import { FormField } from '@lifequest/forms';
import { Preferences } from '@lifequest/utilities';
import { Celebrations } from '@lifequest/data-access';
import { LevelCelebration } from '../../../../libs/ui/src/level-celebration';
import { provideRouter } from '@angular/router';

describe('Accessible shared components', () => {
  it('announces an earned level without a modal and allows dismissal', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(LevelCelebration);
    const state = TestBed.inject(Celebrations);
    state.receive({ levelUp: { number: 2, title: 'Finding rhythm', titleAr: 'مستمر' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain(
      'Finding rhythm',
    );
    expect(fixture.nativeElement.querySelector('[role=dialog]')).toBeNull();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=status]')).toBeNull();
  });
  it('clamps progress while exposing a named accessible value', () => {
    const fixture = TestBed.createComponent(Progress);
    fixture.componentRef.setInput('value', 180);
    fixture.componentRef.setInput('label', 'Weekly quest');
    fixture.detectChanges();
    const progress = fixture.nativeElement.querySelector('[role=progressbar]') as HTMLElement;
    expect(progress.getAttribute('aria-valuenow')).toBe('100');
    expect(progress.getAttribute('aria-label')).toBe('Weekly quest');
    fixture.componentRef.setInput('value', -20);
    fixture.detectChanges();
    expect(progress.getAttribute('aria-valuenow')).toBe('0');
  });
  it('emits retry from the accessible error state', () => {
    const fixture = TestBed.createComponent(ErrorState);
    fixture.componentRef.setInput('message', 'Could not load');
    fixture.detectChanges();
    const retry = vi.fn();
    fixture.componentInstance.retry.subscribe(retry);
    fixture.nativeElement.querySelector('button').click();
    expect(retry).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain(
      'Could not load',
    );
  });
  it('does not duplicate the projected input ID on field hosts', () => {
    const fixture = TestBed.createComponent(FormField);
    fixture.componentRef.setInput('id', 'habit-name');
    fixture.componentRef.setInput('label', 'Habit');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('id')).toBeNull();
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe('habit-name');
  });
  it('announces loading without interactive placeholders', () => {
    const fixture = TestBed.createComponent(Skeleton);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-busy=true]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
  it('applies Arabic direction, theme and reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const preferences = TestBed.inject(Preferences);
    preferences.setLanguage('ar');
    preferences.setTheme('dark');
    preferences.setReducedMotion(true);
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(preferences.t('Read', 'اقرأ')).toBe('اقرأ');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
    preferences.setLanguage('en');
    preferences.setTheme('light');
    preferences.setReducedMotion(false);
    vi.unstubAllGlobals();
  });
});
