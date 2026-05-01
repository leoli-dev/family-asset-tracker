import { afterEach, describe, expect, it, vi } from 'vitest';
import { createId } from './uuid';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

const setCrypto = (value: Crypto | undefined) => {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value,
  });
};

afterEach(() => {
  vi.restoreAllMocks();

  if (originalCryptoDescriptor) {
    Object.defineProperty(globalThis, 'crypto', originalCryptoDescriptor);
  } else {
    delete (globalThis as { crypto?: Crypto }).crypto;
  }
});

describe('createId', () => {
  it('uses native crypto.randomUUID when available', () => {
    const randomUUID = vi.fn(() => '11111111-1111-4111-8111-111111111111');
    const getRandomValues = vi.fn();

    setCrypto({ randomUUID, getRandomValues } as unknown as Crypto);

    expect(createId()).toBe('11111111-1111-4111-8111-111111111111');
    expect(randomUUID).toHaveBeenCalledOnce();
    expect(getRandomValues).not.toHaveBeenCalled();
  });

  it('falls back to crypto.getRandomValues when randomUUID is missing', () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.set([
        0x12, 0x34, 0x56, 0x78,
        0x9a, 0xbc,
        0xde, 0xf0,
        0x12, 0x34,
        0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
      ]);
      return bytes;
    });

    setCrypto({ getRandomValues } as unknown as Crypto);

    expect(createId()).toBe('12345678-9abc-4ef0-9234-56789abcdef0');
    expect(getRandomValues).toHaveBeenCalledOnce();
  });

  it('still returns a UUID-shaped id when Web Crypto is unavailable', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    setCrypto(undefined);

    expect(createId()).toMatch(uuidPattern);
  });
});
