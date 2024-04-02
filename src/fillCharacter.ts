import { Pool } from "pg";
import { getCredentials } from "./credentials";
import { Character } from './utils';
import { RESET_CHARACTER_WITH_BASE, SELECT_CHARACTER_BASE, SET_SCHEMA } from './databaseScripts';

function generateFillQuery(character: Character) {
    return SET_SCHEMA + RESET_CHARACTER_WITH_BASE.replace("%s", `('${character.name}', ${character.hability}, ${character.stamina}, ${character.luck}, ${character.gold})`)
}

function generateSelectQuery(name: string) {
    return SET_SCHEMA + SELECT_CHARACTER_BASE.replace("%s", name)
}

export async function insertCharacter(character: Character) {

    getCredentials().then((credentials) => {
        const client = new Pool(credentials);

        client.query(generateFillQuery(character));
        client.end();
    });
}

export async function getCharacter(name: string) {
    const credentials = await getCredentials();

    const client = new Pool(credentials);
    let res = await client.query(generateSelectQuery(name));
    client.end();
    return res[1].rows[0]["character"];
}