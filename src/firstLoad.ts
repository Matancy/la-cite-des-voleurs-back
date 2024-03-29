import { readFile } from 'fs/promises';
import { promisify } from 'util';
import fs from 'fs';

const readFileAsync = promisify(fs.readFile)

type node = {
    cell: string,
    text: string,
    links: number[]
}

class Credentials {
    LOGIN= "login";
    PASSWORD= "pass";
}

async function getCredentials(): Promise<Credentials>{
    let credentials: Credentials = new Credentials();

    try{
        credentials = JSON.parse(await readFileAsync(`${__dirname}/assets/credentials.json`, {encoding: 'utf8'}));
    }catch{
        console.warn("No credentials found");
    }

    return credentials;


}

export async function firstLoad(){
    let credentials = getCredentials();
    console.log((await credentials).LOGIN)
    let nodes: node[] = JSON.parse(await readFileAsync(`${__dirname}/assets/story.json`, {encoding: 'utf8'}));

    

}
