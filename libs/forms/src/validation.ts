import { AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

/** Only structured validation responses may become field errors. */
export function applyServerValidation(form: AbstractControl, error: unknown) {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) return;
  const body: unknown = error.error;
  if (
    !body ||
    typeof body !== 'object' ||
    !('code' in body) ||
    body.code !== 'VALIDATION_ERROR' ||
    !('details' in body) ||
    !Array.isArray(body.details)
  )
    return;
  for (const item of body.details as unknown[]) {
    if (
      !item ||
      typeof item !== 'object' ||
      !('field' in item) ||
      typeof item.field !== 'string' ||
      !('message' in item) ||
      typeof item.message !== 'string'
    )
      continue;
    const control = form.get(item.field);
    if (!control) continue;
    control.setErrors({ ...control.errors, server: item.message.slice(0, 300) });
    control.markAsTouched();
  }
}
