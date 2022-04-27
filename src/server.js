import Echo from 'laravel-echo-server';
import { checkEnv } from "./utils.js";

/**
 * @param env {{AUTH_HOST:string, AUTH_ENDPOINT:string, APP_DEBUG:string, PORT:string, PROTO:string, DATABASE:string, REDIS_HOST:string, REDIS_PORT:string, REDIS_PASSWORD:string, APP_ID:string, APP_KEY:string, ALLOWED_ORIGIN:string, PROTO:string, SSL_CERT:string, SSL_KEY:string, APP_NAME: string}}
 */
const start = (env) => {
    let options = {
        authHost: env.AUTH_HOST,
        authEndpoint: env.AUTH_ENDPOINT,
        devMode: env.APP_DEBUG,
        port: env.PORT,
        protocol: env.PROTO,
        database: env.DATABASE,
        databaseConfig: {
            redis: {
                host: env.REDIS_HOST,
                port: env.REDIS_PORT,
                password: env.REDIS_PASSWORD,
            }
        },
        clients: [
            {
                appId: env.APP_ID,
                key: env.APP_KEY
            }
        ],
        apiOriginAllow: {
            allowCors: true,
            allowOrigin: env.ALLOWED_ORIGIN,
            allowMethods: "GET, POST",
            allowHeaders: "Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept, Authorization, X-CSRF-TOKEN, X-Socket-Id"
        }
    };

    if (env.PROTO === "https") {
        options = {
            ...options,
            sslCertPath: env.SSL_CERT,
            sslKeyPath: env.SSL_KEY
        }
        console.log("Running on wss");
    }

    Echo.run(options).then(r => {
        console.log(`${env.APP_NAME} websocket server running at ${new Date().toLocaleDateString()} on port ${env.PORT}`);
    });
}

const requirements = [
    'AUTH_HOST', 'AUTH_ENDPOINT', 'APP_DEBUG', 'PORT', 'PROTO', 'DATABASE', 'REDIS_HOST', 'REDIS_PORT',
    'APP_ID', 'APP_KEY', 'ALLOWED_ORIGIN', 'PROTO', 'SSL_CERT', 'SSL_KEY', 'APP_NAME', 'PORT'
];

let env = checkEnv(requirements);

start(env);