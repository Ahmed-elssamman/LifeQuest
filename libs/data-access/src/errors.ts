import { HttpErrorResponse } from '@angular/common/http';

const arabicMessages: Record<string, string> = {
  'Please check the highlighted fields.': 'راجع الحقول الموضحة وأكمل البيانات المطلوبة.',
  'Invalid email or password.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'Not enough XP for this reward.': 'رصيد نقاطك لا يكفي لهذه المكافأة بعد.',
  'Insufficient XP.': 'رصيد نقاطك لا يكفي لهذه المكافأة بعد.',
  'Resume this habit before recording an action.': 'استأنف هذه العادة قبل تسجيل خطوة جديدة.',
  'This habit is not scheduled for today.': 'هذه العادة غير مجدولة لليوم.',
  'Use the minimum action option for a smaller step.':
    'اختر الخطوة الصغيرة لتسجيل إنجاز أقل من الهدف.',
  'Choose at least one day for a custom schedule.': 'اختر يوماً واحداً على الأقل للجدول المخصص.',
  'Schedule days must be unique.': 'اختر كل يوم مرة واحدة في الجدول.',
  'Numeric goals need a positive target.': 'أدخل قيمة موجبة للهدف الرقمي.',
  'Target date must be after the start date.': 'يجب أن يكون موعد الهدف بعد تاريخ البداية.',
  'Choose a deadline within the next month.': 'اختر موعداً نهائياً خلال الشهر القادم.',
  'This quest has ended. Start a fresh quest with what you learned.':
    'انتهت هذه المهمة. ابدأ مهمة جديدة مستفيداً مما تعلمته.',
  'A task cannot be its own ancestor.': 'لا يمكن ربط المهمة بنفسها أو بإحدى مهامها الفرعية كأصل.',
  'This action has already been recorded.': 'تم تسجيل هذا الإجراء بالفعل.',
  'We could not find that item.': 'لم نتمكن من العثور على هذا العنصر.',
  'A linked item is no longer available.': 'أحد العناصر المرتبطة لم يعد متاحاً.',
};

export function errorMessage(error: unknown): string {
  const arabic = typeof document !== 'undefined' && document.documentElement.lang === 'ar';
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return arabic
        ? 'يبدو أنك غير متصل. تحقق من اتصالك وحاول مجدداً.'
        : 'You seem to be offline. Check your connection and try again.';
    const body: unknown = error.error;
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : '';
    if (!arabic && message) return message;
    if (arabic) {
      if (arabicMessages[message]) return arabicMessages[message];
      if (error.status === 401) return 'تحقق من بيانات الدخول وسجّل الدخول للمتابعة.';
      if (error.status === 403) return 'هذا الإجراء غير متاح لحسابك حالياً.';
      if (error.status === 404) return 'لم نتمكن من العثور على هذا العنصر.';
      if (error.status === 409)
        return 'تم تسجيل الإجراء أو تغيّرت البيانات. حدّث الصفحة قبل المحاولة مجدداً.';
      if (error.status === 429) return 'محاولات كثيرة في وقت قصير. انتظر قليلاً وحاول مجدداً.';
      if (error.status === 400)
        return 'تعذر إتمام الإجراء بهذه البيانات. راجع القيم والخيارات ثم حاول مجدداً.';
    }
  }
  return arabic
    ? 'تعذر إتمام الإجراء الآن. حاول مرة أخرى.'
    : 'We could not complete that action. Please try again.';
}
