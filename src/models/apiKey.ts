import { PrismaClient, APIKey } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID, randomBytes, CipherGCMTypes } from 'crypto';
import config from '../config';
import { decrypt, encrypt } from '../utils/encryption';

// We don't want these changing after we've encrypted and stored values

const getAPIKeyById = (prisma: PrismaClient) => async (apiKeyId: string): Promise<APIKey | null> => {
    return prisma.aPIKey.findUnique({
        where: { id: apiKeyId }
    });
};

type APIKeyGenerationResponse = {
    id: string;
    keyHash: string;
    encryptedAPIKey: string;
}

const generateAPIKey = async (): Promise<APIKeyGenerationResponse> => {
    const apiKeyId = randomUUID();
    const apiKey = randomBytes(32).toString('base64');
    const apiKeyAndId = `${apiKeyId}::${apiKey}`;

    // TODO:
    // Add an additional optional expiration date/time to the APIKey

    const saltRounds = 10; // This could be moved to an Environment variable although we don't really want this to change much
    const keyHash = await bcrypt.hash(apiKey, saltRounds);
    const encryptedAPIKey = encrypt(apiKeyAndId
        ,config.encryption.apikey.algorithm
        ,config.encryption.apikey.key
        ,config.encryption.apikey.ivLength);
    return {
        id: apiKeyId,
        keyHash,
        encryptedAPIKey: encryptedAPIKey
    } as APIKeyGenerationResponse;
};

type APIKeyStoreObj = {
    apiKeyId: string;
    keyHash: string;
}
const storeAPIKey = (prisma: PrismaClient) => async ({ apiKeyId, keyHash }: APIKeyStoreObj) => {
    await prisma.aPIKey.create({ data: { id: apiKeyId, keyHash: keyHash } });
};

export { getAPIKeyById, generateAPIKey, storeAPIKey, APIKeyStoreObj }