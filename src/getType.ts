import { Pool } from "pg";
import { getCredentials } from "./credentials";
import { SELECT_NODE_TYPE_BASE, SET_SCHEMA } from "./databaseScripts";

function generateSelectQuery(nodeId: number){
    return SET_SCHEMA+SELECT_NODE_TYPE_BASE.replace("%s", nodeId.toString());
}

export async function getType(nodeId: number){
    const credentials = await getCredentials();

    const client = new Pool(credentials);
    let res = await client.query(generateSelectQuery(nodeId));
    client.end();
    return res[1].rows[0]["type"];
}

