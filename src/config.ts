import { CipherGCMTypes } from "crypto"

type Config = {
    globals: {
        env: string;
    },
    encryption: {
        apikey: {
            enabled: boolean;
            key: string;
            algorithm: CipherGCMTypes;
            ivLength: number;
        }
    },
    database: {
        url: string;
    }
}

const config: Config = {
    globals: {
        env: process.env.NODE_ENV ? process.env.NODE_ENV : 'test'
    },
    encryption: {
        apikey: {
            enabled: (parseInt(process.env.ENABLE_APIKEY_MIDDLEWARE) ? true : false),
            key: process.env.APIKEY_ENCRYPTION_KEY,
            algorithm: 'aes-256-cbc' as CipherGCMTypes,
            ivLength: 16

        }
    },
    database: {
        url: process.env.DATABASE_URL
    }
}

export default config;