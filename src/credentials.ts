import fs from 'fs';
import { promisify } from 'util';
const readFileAsync = promisify(fs.readFile)

class Credentials {
    readonly user: string = "login";
    readonly password: string = "pass";
    readonly port: number = 1234;
    readonly host: string = "host";
    readonly database: string = "db";
}

export async function getCredentials(): Promise<Credentials> {
    let credentials: Credentials = new Credentials();

    try {
        credentials = JSON.parse(await readFileAsync(`${__dirname}/assets/credentials.json`, { encoding: 'utf8' }));
    } catch {
        console.warn("No credentials found");
    }

    return credentials;

}