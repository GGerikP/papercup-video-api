import { CipherGCMTypes, createCipheriv, createDecipheriv, randomBytes } from "crypto";

export function encrypt(text: string, algorithm: CipherGCMTypes, key: string, ivLength: number): string {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  const encryptedCipher = cipher.update(text);

  const encryptedBuffer = Buffer.concat([encryptedCipher, cipher.final()]);

  return iv.toString('hex') + ':' + encryptedBuffer.toString('hex');
}

export function decrypt(text: string, algorithm: CipherGCMTypes, key: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  const decryptedDecipher = decipher.update(encryptedText);

  const decryptedBuffer = Buffer.concat([decryptedDecipher, decipher.final()]);

  return decryptedBuffer.toString();
}
