import fs from 'fs';
import { promisify } from 'util';
import { Credentials } from './models/credentials';
const readFileAsync = promisify(fs.readFile)

export async function getCredentials(): Promise<Credentials> {
    let credentials: Credentials = new Credentials();

    try {
        credentials = JSON.parse(await readFileAsync(`${__dirname}/assets/credentials.json`, { encoding: 'utf8' }));
    } catch {
        console.warn("No credentials found");
    }

    return credentials;

}