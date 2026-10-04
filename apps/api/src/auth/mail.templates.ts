import type { TokenPurpose } from '@prisma/client';

export type EmailLanguage = 'ar' | 'en';
function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]!);
}
export function renderAuthEmail(purpose: TokenPurpose, language: EmailLanguage, url: string) {
  const arabic = language === 'ar';
  const verification = purpose === 'VERIFY_EMAIL';
  const subject = arabic
    ? verification
      ? 'تأكيد بريدك الإلكتروني في مِرحال'
      : 'إعادة تعيين كلمة المرور في مِرحال'
    : verification
      ? 'Confirm your MIRHAL email'
      : 'Reset your MIRHAL password';
  const intro = arabic
    ? verification
      ? 'أكد بريدك الإلكتروني لمتابعة رحلتك في مِرحال.'
      : 'استخدم الرابط التالي لإعادة تعيين كلمة المرور.'
    : verification
      ? 'Confirm your email to continue your MIRHAL journey.'
      : 'Use the link below to reset your password.';
  const action = arabic
    ? verification
      ? 'تأكيد البريد الإلكتروني'
      : 'إعادة تعيين كلمة المرور'
    : verification
      ? 'Confirm email'
      : 'Reset password';
  const ignore = arabic
    ? 'إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.'
    : 'If you did not request this, you can ignore this email.';
  const dir = arabic ? 'rtl' : 'ltr';
  const brand = arabic ? 'مِرحال' : 'MIRHAL';
  const html = `<!doctype html><html lang="${language}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f8f7fc;color:#29243d;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px"><tr><td dir="${dir}" align="${arabic ? 'right' : 'left'}" style="padding:24px;line-height:1.7"><h1 style="font-size:24px;margin:0 0 16px">${brand}</h1><p>${escapeHtml(intro)}</p><p style="margin:28px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#5b47bd;color:#fff;padding:12px 16px;border-radius:8px;text-decoration:none">${escapeHtml(action)}</a></p><p style="word-break:break-all"><a dir="ltr" href="${escapeHtml(url)}" style="direction:ltr">${escapeHtml(url)}</a></p><p style="font-size:14px;color:#615a70">${escapeHtml(ignore)}</p></td></tr></table></td></tr></table></body></html>`;
  return { subject, text: `${intro}\n\n${url}\n\n${ignore}`, html };
}
