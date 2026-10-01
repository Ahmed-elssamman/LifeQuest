import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class Preferences {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly language = signal<'en' | 'ar'>('en');
  readonly theme = signal<'light' | 'dark' | 'system'>('system');
  readonly rtl = computed(() => this.language() === 'ar');
  constructor() {
    if (this.browser) {
      try {
        const language = localStorage.getItem('lq-language');
        if (language === 'ar') this.language.set(language);
        const theme = localStorage.getItem('lq-theme');
        if (theme === 'dark' || theme === 'light') this.theme.set(theme);
      } catch {
        /* Private browsing may disable storage. */
      }
      this.apply();
      globalThis
        .matchMedia?.('(prefers-color-scheme: dark)')
        .addEventListener('change', () => this.apply());
    }
  }
  t(en: string, ar: string) {
    return this.rtl() ? ar : en;
  }
  label(value: string) {
    const labels: Record<string, string> = {
      ACTIVE: 'نشط',
      PLANNED: 'مخطط',
      PAUSED: 'متوقف',
      COMPLETED: 'مكتمل',
      ARCHIVED: 'مؤرشف',
      SCHEDULED: 'مجدول',
      INVITED: 'بانتظار الرد',
      ACCEPTED: 'مقبول',
      REJECTED: 'مرفوض',
      CANCELLED: 'ملغى',
      DRAFT: 'مسودة',
      PENDING: 'معلق',
      BLOCKED: 'محظور',
      HIGH: 'عالية',
      MEDIUM: 'متوسطة',
      LOW: 'منخفضة',
      SUBMITTED: 'مُرسل',
      REVIEWING: 'قيد المراجعة',
      IN_PROGRESS: 'جارٍ العمل',
      RESOLVED: 'تم الحل',
      CLOSED: 'مغلق',
      SUSPENDED: 'موقوف',
      DELETED: 'محذوف',
      USER: 'مستخدم',
      ADMIN: 'مدير',
      SUPER_ADMIN: 'مدير عام',
      MODERATOR: 'مشرف',
      SUPPORT: 'دعم',
      CONTENT_MANAGER: 'مدير محتوى',
      ANALYST: 'محلل',
      SCORE: 'منافسة النقاط',
      CONSISTENCY: 'منافسة الالتزام',
      IMPROVEMENT: 'منافسة التحسن',
      TARGET: 'تحدي الهدف',
      STREAK: 'تحدي الاستمرارية',
      COOPERATIVE: 'تحدٍ تعاوني',
      TODO: 'للقيام به',
      BUG: 'مشكلة تقنية',
      SUGGESTION: 'اقتراح',
      UX: 'تجربة الاستخدام',
      FEATURE: 'طلب ميزة',
      CONTENT: 'المحتوى',
      COMPLAINT: 'شكوى',
      OTHER: 'أخرى',
      signup: 'تسجيل حساب',
      onboarding_completed: 'إكمال البداية',
      goal_created: 'إنشاء هدف',
      project_created: 'إنشاء مشروع',
      task_completed: 'إكمال مهمة',
      habit_created: 'إنشاء عادة',
      habit_completed: 'إكمال عادة',
      daily_checkin_completed: 'تسجيل التأمل اليومي',
      quest_completed: 'إكمال مهمة أسبوعية',
      challenge_created: 'إنشاء تحدٍ',
      challenge_joined: 'الانضمام لتحدٍ',
      challenge_completed: 'إكمال تحدٍ',
      level_up: 'مستوى جديد',
      achievement_unlocked: 'إنجاز جديد',
      reward_redeemed: 'استبدال مكافأة',
      feedback_submitted: 'إرسال ملاحظة',
    };
    return this.rtl()
      ? (labels[value] ?? value.replaceAll('_', ' '))
      : value.replaceAll('_', ' ').toLowerCase();
  }
  setLanguage(value: 'en' | 'ar') {
    this.language.set(value);
    this.persist('lq-language', value);
    this.apply();
  }
  setTheme(value: 'light' | 'dark' | 'system') {
    this.theme.set(value);
    this.persist('lq-theme', value);
    this.apply();
  }
  setReducedMotion(value: boolean) {
    this.document.documentElement.classList.toggle('reduce-motion', value);
  }
  private persist(key: string, value: string) {
    if (this.browser) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* Preferences remain available for this session. */
      }
    }
  }
  private apply() {
    const root = this.document.documentElement;
    root.lang = this.language();
    root.dir = this.rtl() ? 'rtl' : 'ltr';
    if (this.browser)
      root.classList.toggle(
        'dark',
        this.theme() === 'dark' ||
          (this.theme() === 'system' &&
            globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches),
      );
  }
}
