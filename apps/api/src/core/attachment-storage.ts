import { Injectable } from '@nestjs/common';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { put, get, del } from '@vercel/blob';

/** Private Blob storage on Vercel; persistent local files for standalone servers. */
@Injectable()
export class AttachmentStorage {
  private readonly root = resolve(process.env['UPLOAD_DIR'] ?? '.local/uploads');
  private get cloud() {
    if (process.env['VERCEL'] && !process.env['BLOB_READ_WRITE_TOKEN'])
      throw new Error('Private attachment storage is not configured');
    return Boolean(process.env['BLOB_READ_WRITE_TOKEN']);
  }
  async put(data: Buffer) {
    const key = randomUUID();
    if (this.cloud) {
      await put(`feedback/${key}`, data, { access: 'private', addRandomSuffix: false });
      return key;
    }
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    await writeFile(this.path(key), data, { mode: 0o600, flag: 'wx' });
    return key;
  }
  async read(key: string) {
    this.path(key);
    if (this.cloud) {
      const result = await get(`feedback/${key}`, { access: 'private' });
      if (!result || result.statusCode !== 200 || !result.stream)
        throw new Error('Attachment not found');
      const reader = result.stream.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 2 * 1024 * 1024) throw new Error('Attachment exceeds size limit');
          chunks.push(value);
        }
        return Buffer.concat(chunks);
      } finally {
        await reader.cancel();
      }
    }
    return readFile(this.path(key));
  }
  async remove(key: string) {
    this.path(key);
    if (this.cloud) {
      await del(`feedback/${key}`);
      return;
    }
    await unlink(this.path(key)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
  private path(key: string) {
    if (!/^[a-f0-9-]{36}$/.test(key)) throw new Error('Invalid storage reference');
    return resolve(this.root, key);
  }
}

export const attachmentSelect = { id: true, name: true, size: true, mimeType: true } as const;
