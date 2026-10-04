import { Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import nodemailer from 'nodemailer';
import type { TokenPurpose } from '@prisma/client';
import { EmailLanguage, renderAuthEmail } from './mail.templates';

type Message = { to: string; purpose: TokenPurpose; url: string; language: EmailLanguage };
type Delivery = Message & {
  from: string;
  subject: string;
  text: string;
  html: string;
  key: string;
};
interface EmailProvider {
  send(message: Delivery): Promise<void>;
}

class SmtpProvider implements EmailProvider {
  async send(message: Delivery) {
    const transport = nodemailer.createTransport({
      host: process.env['SMTP_HOST'],
      port: Number(process.env['SMTP_PORT'] ?? 465),
      secure: process.env['SMTP_SECURE'] === 'true',
      requireTLS: process.env['SMTP_SECURE'] !== 'true',
      auth: { user: process.env['SMTP_USER'], pass: process.env['SMTP_PASSWORD'] },
      connectionTimeout: 10000,
      socketTimeout: 15000,
      logger: false,
      debug: false,
    });
    try {
      await transport.sendMail({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } finally {
      transport.close();
    }
  }
}

class DeliveryError extends Error {
  constructor(readonly classification: 'temporary' | 'permanent') {
    super('Email delivery failed');
  }
}
function classifyDeliveryError(error: unknown): 'temporary' | 'permanent' {
  if (error instanceof DeliveryError) return error.classification;
  if (typeof error === 'object' && error !== null) {
    if ('responseCode' in error && typeof error.responseCode === 'number')
      return error.responseCode >= 500 ? 'permanent' : 'temporary';
    if ('code' in error && error.code === 'EAUTH') return 'permanent';
  }
  return 'temporary';
}
class ResendProvider implements EmailProvider {
  async send(message: Delivery) {
    const request = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env['RESEND_API_KEY']}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': message.key,
      },
      body: JSON.stringify({
        from: message.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      let response: Response;
      try {
        response = await fetch('https://api.resend.com/emails', {
          ...request,
          signal: AbortSignal.timeout(10000),
        });
      } catch (error) {
        if (attempt === 1) throw error;
        await delay(250);
        continue;
      }
      if (response.ok) return;
      if (response.status >= 500 && attempt === 0) {
        await delay(250);
        continue;
      }
      throw new DeliveryError(
        response.status === 429 || response.status >= 500 ? 'temporary' : 'permanent',
      );
    }
  }
}

@Injectable()
export class MailAdapter implements OnModuleInit {
  readonly outbox: Message[] = [];
  onModuleInit() {
    if (process.env['NODE_ENV'] === 'production' && this.enabled) this.assertConfigured();
  }
  get enabled() {
    return process.env['MAIL_MODE'] !== 'disabled';
  }
  private get providerName() {
    return (
      process.env['EMAIL_PROVIDER'] ?? (process.env['NODE_ENV'] === 'production' ? '' : 'file')
    );
  }
  configurationHealth() {
    const provider = this.providerName;
    if (!this.enabled) return { provider, status: 'disabled' as const };
    try {
      this.assertConfigured();
      return { provider, status: 'configured' as const };
    } catch {
      return { provider, status: 'incomplete' as const };
    }
  }
  assertConfigured() {
    if (!this.enabled)
      throw new ServiceUnavailableException(
        'Email verification and password recovery are currently unavailable.',
      );
    const provider = this.providerName;
    const required = ['APP_URL', 'SMTP_FROM'];
    if (provider === 'smtp') required.push('SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD');
    else if (provider === 'resend') required.push('RESEND_API_KEY');
    else if (provider !== 'file' || process.env['NODE_ENV'] === 'production')
      throw new ServiceUnavailableException('Email provider is not configured.');
    if (provider !== 'file' && required.some((name) => !process.env[name]))
      throw new ServiceUnavailableException('Email delivery is not configured.');
    if (
      provider === 'smtp' &&
      (!Number.isInteger(Number(process.env['SMTP_PORT'] ?? 465)) ||
        Number(process.env['SMTP_PORT'] ?? 465) < 1 ||
        Number(process.env['SMTP_PORT'] ?? 465) > 65535 ||
        !['true', 'false'].includes(process.env['SMTP_SECURE'] ?? 'true'))
    )
      throw new ServiceUnavailableException('SMTP port is invalid.');
    if (provider !== 'file') {
      try {
        const url = new URL(process.env['APP_URL']!);
        if (
          url.protocol !== 'https:' &&
          (process.env['NODE_ENV'] === 'production' || url.protocol !== 'http:')
        )
          throw new Error('Invalid protocol');
      } catch {
        throw new ServiceUnavailableException('APP_URL is invalid.');
      }
    }
  }
  async send(to: string, purpose: TokenPurpose, token: string, language: EmailLanguage = 'ar') {
    this.assertConfigured();
    const path = purpose === 'VERIFY_EMAIL' ? 'verify-email' : 'reset-password';
    const origin = (process.env['APP_URL'] ?? 'http://localhost:4200').replace(/\/$/, '');
    const url = `${origin}/auth/${path}?token=${encodeURIComponent(token)}`;
    const mail: Message = { to, purpose, url, language };
    if (process.env['NODE_ENV'] === 'test') {
      this.outbox.push(mail);
      return;
    }
    if (this.providerName === 'file') {
      await mkdir('.local/mail', { recursive: true, mode: 0o700 });
      await writeFile(`.local/mail/${randomUUID()}.json`, JSON.stringify(mail), { mode: 0o600 });
      return;
    }
    const delivery: Delivery = {
      ...mail,
      ...renderAuthEmail(purpose, language, url),
      from: process.env['SMTP_FROM']!,
      key: createHash('sha256').update(`${purpose}:${token}`).digest('hex'),
    };
    const provider: EmailProvider =
      this.providerName === 'smtp' ? new SmtpProvider() : new ResendProvider();
    try {
      await provider.send(delivery);
      console.log(
        JSON.stringify({
          level: 'info',
          event: 'email_delivery',
          provider: this.providerName,
          purpose,
          status: 'sent',
        }),
      );
    } catch (error) {
      const classification = classifyDeliveryError(error);
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'email_delivery',
          provider: this.providerName,
          purpose,
          status: 'failed',
          classification,
        }),
      );
      throw new ServiceUnavailableException(
        'Email could not be delivered. Please try again later.',
      );
    }
  }
}
