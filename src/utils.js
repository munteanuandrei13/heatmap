import fs from "fs";
import DotEnv from "dotenv";

/**
 * @param {string[]} requirements
 */
export const checkEnv = (requirements) => {
    const args = process.argv.slice(2);

    if(!args[0] || !fs.existsSync(args[0])) {
        console.log('You need to pass a valid .env file for the websocket server.');
        process.exit();
    }

    DotEnv.config({ path: args[0] });

    for(const [key, value] of requirements.entries()) {
        if(!process.env[value]) {
            console.log(`${value} is missing from your .env file.`);
            process.exit();
        }
    }

    return process.env;
}