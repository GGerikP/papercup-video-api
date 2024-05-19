import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { getAPIKeyById } from '../models/apiKey';
import config from '../config';
import { decrypt } from '../utils/encryption';

const apiKeyMiddleware = (prisma: PrismaClient) => {
    // Return the actual middleware function
    return async (req: Request, res: Response, next: NextFunction) => {

        if (config.globals.env === 'test') {
            // Authorization is disabled when running tests
            next();
            return;
        }
        // Authorization Header should be in the format:
        // Authorization APIKey-V1 <Encryption Key>
        const apiKeyStringValue = req.headers['authorization'] as string;
        if (!apiKeyStringValue) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const apiKeyHeaderParts = apiKeyStringValue.split('APIKey-V1 ');

        if (apiKeyHeaderParts.length !== 2) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const encryptedApiKeyValue = apiKeyHeaderParts[1]

        if (!encryptedApiKeyValue) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const decryptedAPIKey = decrypt(encryptedApiKeyValue, config.encryption.apikey.algorithm, config.encryption.apikey.key)
        const apiKeyParts = decryptedAPIKey.split("::");
        const apiKeyId = apiKeyParts[0];
        const apiKeyValue = apiKeyParts[1];
    
        const apiKeyRecord = await getAPIKeyById(prisma)(apiKeyId);
        if (!apiKeyRecord) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify the API key
        const isValid = await bcrypt.compare(apiKeyValue, apiKeyRecord.keyHash);

        if (!isValid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        next();
    };
};

export default apiKeyMiddleware;
