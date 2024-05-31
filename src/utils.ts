import { Riddle } from "./models/Riddle";
import { promisify } from 'util';
import fs from 'fs';
const readFileAsync = promisify(fs.readFile)


export function normalizeText(text: string) {
    return text.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/%[^%]*%/g, ' ');
}

export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function loadRiddles() {
    let riddles: Riddle[] = JSON.parse(await readFileAsync(`${__dirname}/assets/riddles.json`, { encoding: 'utf8' }));
    return riddles
}