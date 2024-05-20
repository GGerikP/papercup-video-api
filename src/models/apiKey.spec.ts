import bcrypt from 'bcrypt';
import config from '../config';
import { generateAPIKey } from "./apiKey";
import { CipherGCMTypes } from 'crypto';

jest.mock('../config');

describe('generateAPIKey', () => {

  beforeEach(() => {
    // Reset mocks and create fresh instances
    jest.clearAllMocks();
    config.globals = {
      env: 'stage',
    }
    config.encryption = {
      apikey: {
        enabled: true,
        algorithm: "aes-256-cbc" as CipherGCMTypes,
        key: "d191ec9edc735fbf1d738ebf689d2f96b8e0a0402a46bf4d1dee36c30417fe77",
        ivLength: 16,
      }
    };
  });

  // Generates a unique API key ID using randomUUID()
  it('should generate a unique API key ID using randomUUID()', async () => {
    const result = await generateAPIKey();
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);
  });

  // bcrypt.hash() throws an error
  it('should throw an error when bcrypt.hash() is called', async () => {
    jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('bcrypt error') as never);
    await expect(generateAPIKey()).rejects.toThrow('bcrypt error');
  });
});
