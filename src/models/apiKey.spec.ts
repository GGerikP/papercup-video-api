import bcrypt from 'bcrypt';


import { generateAPIKey } from "./apiKey";

describe('generateAPIKey', () => {

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
