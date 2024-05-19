
import { PrismaClient } from '@prisma/client';
import { APIKeyStoreObj, generateAPIKey, storeAPIKey } from '../src/models/apiKey';

const prisma = new PrismaClient();


generateAPIKey().then((apiKeyResponse) => {
    const apiKeyStoreObj: APIKeyStoreObj = {
        apiKeyId: apiKeyResponse.id,
        keyHash: apiKeyResponse.keyHash
    }
    storeAPIKey(prisma)(apiKeyStoreObj).then(() => {
        console.log(`New API key stored securely: ${apiKeyResponse.encryptedAPIKey}.  Store this securely and never expose it publicly.`);
    })
});
