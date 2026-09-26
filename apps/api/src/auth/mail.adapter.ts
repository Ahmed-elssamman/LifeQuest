import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
@Injectable()
export class MailAdapter {
  readonly outbox: { to: string; purpose: string; url: string }[] = [];
  get enabled() {
    return process.env['MAIL_MODE'] !== 'disabled';
  }
  assertConfigured() {
    if (!this.enabled)
      throw new ServiceUnavailableException(
        'Email verification and password recovery are currently unavailable.',
      );
    if (
      process.env['NODE_ENV'] === 'production' &&
      (!process.env['SMTP_HOST'] || !process.env['SMTP_FROM'] || !process.env['APP_URL'])
    )
      throw new ServiceUnavailableException(
        'Email delivery is not configured. Please contact support.',
      );
  }
  async send(to: string, purpose: string, token: string) {
    this.assertConfigured();
    const path = purpose === 'VERIFY_EMAIL' ? 'verify-email' : 'reset-password';
    const url = `${process.env['APP_URL'] ?? 'http://localhost:4200'}/auth/${path}?token=${encodeURIComponent(token)}`;
    const mail = { to, purpose, url };
    if (process.env['NODE_ENV'] === 'test') this.outbox.push(mail);
    else if (process.env['SMTP_HOST']) {
      const transport = nodemailer.createTransport({
        host: process.env['SMTP_HOST'],
        port: Number(process.env['SMTP_PORT'] ?? 587),
        secure: process.env['SMTP_SECURE'] === 'true',
        requireTLS: process.env['SMTP_SECURE'] !== 'true',
        auth: process.env['SMTP_USER']
          ? { user: process.env['SMTP_USER'], pass: process.env['SMTP_PASSWORD'] }
          : undefined,
        connectionTimeout: 10000,
        socketTimeout: 15000,
        logger: false,
        debug: false,
      });
      try {
        await transport.sendMail({
          from: process.env['SMTP_FROM'],
          to,
          subject:
            purpose === 'VERIFY_EMAIL'
              ? 'Confirm your LifeQuest email'
              : 'Reset your LifeQuest password',
          text: `Continue your LifeQuest journey:\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
        });
      } catch {
        throw new ServiceUnavailableException(
          'Email could not be delivered. Please try again later.',
        );
      } finally {
        transport.close();
      }
    } else {
      await mkdir('.local/mail', { recursive: true, mode: 0o700 });
      await writeFile(`.local/mail/${randomUUID()}.json`, JSON.stringify(mail), { mode: 0o600 });
    }
  }
}
