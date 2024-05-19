// Generated by CodiumAI

import { CipherGCMTypes, createCipheriv, randomBytes } from "crypto";
import { decrypt, encrypt } from "./encryption";

const DUMMY_KEY = 'd191ec9edc735fbf1d738ebf689d2f96b8e0a0402a46bf4d1dee36c30417fe77';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc' as CipherGCMTypes;

describe('encrypt', () => {

    it('should encrypt text using provided algorithm, key, and ivLength', () => {
        const text = 'Hello, World!';
        const result = encrypt(text, ALGORITHM, DUMMY_KEY, IV_LENGTH);
        expect(result).toBeDefined();
    });

    // Throws an error if algorithm is invalid
    it('should throw an error if algorithm is invalid', () => {
        const text = 'Hello, World!';
        const algorithm = 'invalid-algorithm' as CipherGCMTypes;

        expect(() => {
            const result = encrypt(text, algorithm, DUMMY_KEY, IV_LENGTH);
        }).toThrowError('Unknown cipher');
    });
});

describe('decrypt', () => {

    it('should decrypt a valid encrypted text with a valid key and algorithm', () => {
        const text = '1234567890abcdef';
        const encryptedText = "bcf01626394a08f82aa2eda65c093282:041ec05268d77250a6937d79a76f8d1f13963166589ce5dfc7b4efb9cb613743";

        const result = decrypt(encryptedText, ALGORITHM, DUMMY_KEY);
        expect(result).toBe(text);
    });

    // Throws an error when the encrypted text is empty
    it('should throw an error when the encrypted text is empty', () => {
        const text = '';

        expect(() => {
            decrypt(text, ALGORITHM, DUMMY_KEY);
        }).toThrow();
    });
});