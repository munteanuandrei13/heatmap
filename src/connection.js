import {Sequelize} from "sequelize";
import { checkEnv } from './utils.js';


const requirements = [
    'DB_HOST', 'DB_CONNECTION', 'DB_DATABASE', 'DB_USERNAME',
    // 'DB_PASSWORD'
];

let env = checkEnv(requirements);

// export const sequelize = new Sequelize('node', 'root', '', {
//     host: 'localhost',
//     dialect: 'mysql'
// });

export const sequelize = new Sequelize(env.DB_DATABASE, env.DB_USERNAME, env.DB_PASSWORD, {
    host: env.DB_HOST,
    dialect: env.DB_CONNECTION
});
