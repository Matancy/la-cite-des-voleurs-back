import { Pool } from "pg";
import { getCredentials } from "./credentials";
import { User } from "./models/User";
import { CREATE_USER_BASE, RESET_CHARACTER_WITH_BASE, SELECT_USER_BASE, SET_SCHEMA, UPDATE_USER_BASE } from "./databaseScripts";

function generateFillQuery(user: User) {
    return SET_SCHEMA + CREATE_USER_BASE.replace("%s", `('${user.id}', '${user.password}', ${user.save ? user.save : "null"})`)
}

function generateSelectQuery(user: User) {
    return SET_SCHEMA + SELECT_USER_BASE.replace("%1s", user.id).replace("%2s", user.password)
}


function generateUpdateQuery(user: User){
    console.log(JSON.stringify(user.save))
    console.log(user.save)
    return SET_SCHEMA + UPDATE_USER_BASE.replace("%1s", JSON.stringify(user.save)).replace("%2s", user.id).replace("%3s", user.password)
}


export async function createUser(user: User) {
    const credentials = await getCredentials();
    const client = new Pool(credentials);

    await client.query(generateFillQuery(user));
    client.end();
}

export async function getUser(user: User) {
    const credentials = await getCredentials();

    const client = new Pool(credentials);
    let res = await client.query(generateSelectQuery(user));
    client.end();
    console.log(res[1].rows[0])
    return res[1].rows[0]['statistics'];
}

export async function updateUser(user: User){
    const credentials = await getCredentials();
    const client = new Pool(credentials);
    generateUpdateQuery(user)
    await client.query(generateUpdateQuery(user));
    client.end();
}

