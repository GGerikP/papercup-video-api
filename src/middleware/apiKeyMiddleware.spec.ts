import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { decrypt } from '../utils/encryption';
import apiKeyMiddleware from './apiKeyMiddleware';
import { getAPIKeyById } from '../models/apiKey';
import config from '../config';
import { CipherGCMTypes } from 'crypto';

// Mock external modules
jest.mock('bcrypt');
jest.mock('../utils/encryption');
jest.mock('../models/apiKey');
jest.mock('../config');

// TypeScript does not know about Jest's mocking, so we tell it explicitly
const mockBcrypt = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>;
const mockGetAPIKeyById = getAPIKeyById as jest.MockedFunction<typeof getAPIKeyById>;

const NOW = new Date();

// Helper to create a mock Express response
const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
};

// Helper to create a mock Express request
const createMockRequest = (headers: Record<string, string>) => {
    const req: Partial<Request> = { headers };
    return req as Request;
};

describe('API Key Middleware', () => {
    let prisma: PrismaClient;
    let nextFunction: NextFunction;

    beforeEach(() => {
        // Reset mocks and create fresh instances
        jest.clearAllMocks();
        prisma = new PrismaClient();
        nextFunction = jest.fn();

        // Default Mocks
        mockDecrypt.mockReturnValue("1::correctKey");
        config.globals = {
            env: 'stage',
        }
        config.encryption = {
            apikey: {
                enabled: true,
                algorithm: "aes-256-cbc" as CipherGCMTypes,
                key: "12345678901234567890123456789012",
                ivLength: 16,
            }
        };
    });

    it('should call next() when API key is valid', async () => {
        const req = createMockRequest({ authorization: 'APIKey-V1 encryptedKeyValue' });
        const res = createMockResponse();

        // Mock getAPIKeyById to simulate fetching a key from the database
        mockGetAPIKeyById.mockImplementation((prisma) => {
            return async (id: string) => ({ id: "1", keyHash: "$2b$10$hashOfCorrectKey", createdAt: NOW });
        });

        // Mock bcrypt to simulate a successful comparison
        mockBcrypt.mockReturnValue(true as never);

        const middleware = apiKeyMiddleware(prisma);

        await middleware(req, res, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(mockDecrypt).toHaveBeenCalledWith("encryptedKeyValue", "aes-256-cbc", "12345678901234567890123456789012");
    });

    it('should respond with 401 if the API key is missing', async () => {
        const req = createMockRequest({});
        const res = createMockResponse();

        const middleware = apiKeyMiddleware(prisma);

        await middleware(req, res, nextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should respond with 403 if the API key format is wrong', async () => {
        const req = createMockRequest({ authorization: 'WrongFormat keyvalue' });
        const res = createMockResponse();

        const middleware = apiKeyMiddleware(prisma);

        await middleware(req, res, nextFunction);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should respond with 401 if the API key is incorrect', async () => {
        const req = createMockRequest({ authorization: 'APIKey-V1 encryptedKeyValue' });
        const res = createMockResponse();

        // Mock getAPIKeyById to simulate fetching a key from the database
        mockGetAPIKeyById.mockImplementation((prisma) => {
            return async (id: string) => ({ id: "1", keyHash: "$2b$10$hashOfCorrectKey", createdAt: NOW });
        });

        // Mock bcrypt to simulate a failed comparison
        mockBcrypt.mockResolvedValue(false as never);

        const middleware = apiKeyMiddleware(prisma);

        await middleware(req, res, nextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should respond with 401 if no API key record is found', async () => {
        const req = createMockRequest({ authorization: 'APIKey-V1 encryptedKeyValue' });
        const res = createMockResponse();

        // Mock getAPIKeyById to simulate not finding the key in the database
        mockGetAPIKeyById.mockImplementation((prisma) => {
            return async (id: string) => null;
        });

        const middleware = apiKeyMiddleware(prisma);

        await middleware(req, res, nextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
