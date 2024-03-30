import { Client } from "pg";
import { getCredentials } from "./credentials";
import { SELECT_QUERY_BASE } from "./databaseScripts";

export function getPage(index: number){

    getCredentials().then((credentials) => {
        const client = new Client(credentials);
        client.connect((err) => {
            if (err) throw err;
            console.log("Connected!");
        });
        const query = SELECT_QUERY_BASE.replace("%s", index.toString())
        let res = client.query(query);
        console.log(res)
        client.end();
    });
}