import { readFile } from 'fs/promises';
import { promisify } from 'util';
import fs from 'fs';
import { Client } from 'pg';
import { levenshtein } from './Levenshtein';
import { raw } from 'express';

const readFileAsync = promisify(fs.readFile)
const LUCKY = "chanceux";
const FIGHT = "battez";
const THROW = "jettez";
const CHOICE = "allez-vous";


type rawNode = {
    cell: string,
    text: string,
    links: number[]
}

enum NodeType {
    DICE = "dice",
    SIMPLE_SELECT = "simpleSelect",
    FIGHT = "fight",
    END = "end"
}

class Node {
    cell: string;
    text: string;
    type: NodeType;
    links: number[]
}

class Credentials {
    readonly user: string = "login";
    readonly password: string = "pass";
    readonly port: number = 1234;
    readonly host: string = "host";
    readonly database: string = "db";
}

async function getCredentials(): Promise<Credentials> {
    let credentials: Credentials = new Credentials();

    try {
        credentials = JSON.parse(await readFileAsync(`${__dirname}/assets/credentials.json`, { encoding: 'utf8' }));
    } catch {
        console.warn("No credentials found");
    }

    return credentials;

}

function detectType(rawNode: rawNode) {

    if (rawNode.links.length == 0) {
        return NodeType.END
    }

    let maximumScore = 5;
    let type: NodeType;
    let nodes: Array<Node> = new Array();
    let conflict = false;

    const sentences = rawNode.text.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/%[^%]*%/g, ' ').split(".");
    do {
        conflict = false;
        type = null;

        sentences.forEach((sentence) => {
            console.log("analyzing sentence " + sentence)
            console.log(maximumScore)
            const words = sentence.split(" ");
            words.forEach((word) => {

                let score = levenshtein(word, THROW);
                if (score < maximumScore) {
                    if (words.includes("dés") || words.includes("dé")) {
                        if (type != null && type != NodeType.DICE) {
                            conflict = true;
                        } else {
                            type = NodeType.DICE;
                        }
                    }
                }

                score = levenshtein(word, LUCKY)
                if (score < maximumScore) {
                    if (type != null && type != NodeType.DICE) {
                        conflict = true;
                    } else {
                        type = NodeType.DICE;
                    }
                }

                score = levenshtein(word, FIGHT)
                if (score < maximumScore) {
                    if (type != null && type != NodeType.FIGHT) {
                        conflict = true;
                    } else {
                        type = NodeType.FIGHT;
                    }
                }

                score = levenshtein(word, CHOICE)
                if (score < maximumScore) {
                    if (type != null && type != NodeType.SIMPLE_SELECT) {
                        conflict = true;
                    } else {
                        type = NodeType.SIMPLE_SELECT;
                    }
                }
            })
        })
        if (conflict) {
            console.log(conflict)
            maximumScore--;
        }
        if (maximumScore < 0) {
            throw new Error()
        }
    } while (conflict)

    return type;


}


export async function firstLoad() {
    let rawNodes: rawNode[] = JSON.parse(await readFileAsync(`${__dirname}/assets/story.json`, { encoding: 'utf8' }));
    rawNodes.forEach((rawNode) => {
        console.log("detecting type of node " + rawNode.cell)
        let type = detectType(rawNode);
        console.log("node " + rawNode.cell + " type: " + type)
    })
    getCredentials().then((credentials) => {
        const client = new Client(credentials);
    }

    );


}
