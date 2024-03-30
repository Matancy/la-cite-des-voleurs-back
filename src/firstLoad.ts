import { promisify } from 'util';
import fs from 'fs';
import { Client } from 'pg';
import { levenshtein } from './Levenshtein';
import { getCredentials } from './credentials';
import { CREATE_TABLE, DROP_QUERIES, INSERT_LINKS_QUERY_BASE, INSERT_NODE_QUERY_BASE } from './databaseScripts';
const readFileAsync = promisify(fs.readFile)
const PROMPT_KEYWORD = "observe";


class NodeType {
    static readonly DICE: Type = { keyword: "lancez", type: "dice" };
    static readonly DICE_EXPRESSION: Type = { keyword: "lancez xxxx dés", type: "dice" };
    static readonly LUCK: Type = { keyword: "chance", type: "dice" };
    static readonly LUCK_EXPRESSION: Type = { keyword: "tentez votre chance", type: "dice" }
    static readonly CHOICE: Type = { keyword: "allez-vous", type: "choice" };
    static readonly FIGHT: Type = { keyword: "battez", type: "fight" };
    static readonly DIRECT_LINK = { keyword: "", type: "directLink" };
    static readonly END: Type = { keyword: "", type: "end" };
}

type rawNode = {
    cell: string,
    text: string,
    links: number[]
}

type Type = { keyword: string, type: string }


class Node {
    cell: string;
    text: string;
    type: string;
    prompt: string;
    links: number[];

    constructor(rawNode: rawNode, type: string, prompt: string) {
        this.cell = rawNode.cell;
        this.links = rawNode.links;
        this.text = rawNode.text;
        this.type = type;
        this.prompt = prompt;
    }

    public toNodeDBTable() {
        return "(" + this.cell + ", '" + this.text.replace(/'/g, "''") + "','" + this.type + "','" + ((this.prompt != null)?this.prompt.replace(/'/g, "''"):"none") + "')";
    }

    public toLinksDBTable() {
        let query: string = "";
        this.links.forEach((link) => {
            query += "(" + this.cell + "," + link + "),"
        })
        return query;
    }
}



function detectType(rawNode: rawNode) {

    if (rawNode.links.length == 0) {
        return NodeType.END.type
    }

    let maximumScore = 5;
    let detectedType: Type;
    let conflict = false;

    const isOfType = (word: string, type: Type) => {
        let score = levenshtein(word, type.keyword);
        if (score < maximumScore) {
            if (detectedType != null && detectedType != type) {
                conflict = true;
            } else {
                detectedType = type
            }
        }

    }

    const sentences = rawNode.text.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/%[^%]*%/g, ' ').split(".");
    if (sentences[sentences.length - 1].trim() === "") sentences.pop();

    sentences.forEach((sentence) => {
        let score = levenshtein(sentence.trim(), NodeType.DICE_EXPRESSION.keyword);
        if (score < 10) {
            return NodeType.DICE_EXPRESSION.type
        }

        score = levenshtein(sentence.trim(), NodeType.LUCK_EXPRESSION.keyword);
        if (score < 10) {
            return NodeType.LUCK_EXPRESSION.type
        }
    })

    do {
        conflict = false;
        detectedType = null;

        sentences.forEach((sentence) => {
            const words = sentence.split(" ");
            words.forEach((word) => {
                isOfType(word, NodeType.DICE)
                isOfType(word, NodeType.LUCK)
                isOfType(word, NodeType.FIGHT)
                isOfType(word, NodeType.CHOICE)
            })
        })
        if (conflict) {
            maximumScore--;
        }
        if (maximumScore <= 0) {
            throw new Error("Could not detect type of node. Rework node " + rawNode.cell)
        }
    } while (conflict)

    if (detectedType != NodeType.FIGHT && rawNode.links.length == 1) {
        detectedType = NodeType.DIRECT_LINK;
    }

    return detectedType.type;
}


function generatePrompt(rawNode: rawNode) {
    let maximalScore = 4;
    let sentenceToReturn: string = null
    const sentences = rawNode.text.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/%[^%]*%/g, ' ').split(".");
    if (sentences[sentences.length - 1].trim() === "") sentences.pop();

    sentences.forEach((sentence: string, sentenceIndex: number) => {
        sentence.split(" ").forEach((word) => {
            let score = levenshtein(word, PROMPT_KEYWORD);
            if (score < maximalScore) {
                sentenceToReturn = sentences[sentenceIndex]
            }
        })
    });

    return sentenceToReturn;
}

// To reduce the impact of the database queries, we will execute one single query to populate the DB
function generateQuery(nodes: Array<Node>) {
    let insertNodeQuery: string = "";
    let insertLinksQuery: string = "";

    nodes.forEach((node) => {
        insertNodeQuery += node.toNodeDBTable() + ",";
        insertLinksQuery += node.toLinksDBTable();
    })
    insertNodeQuery = INSERT_NODE_QUERY_BASE.replace("%s", insertNodeQuery.substring(0, insertNodeQuery.length - 1));
    insertLinksQuery = INSERT_LINKS_QUERY_BASE.replace("%s", insertLinksQuery.substring(0, insertLinksQuery.length - 1));

    return DROP_QUERIES.concat(CREATE_TABLE, insertNodeQuery, insertLinksQuery);
}

export async function firstLoad() {
    let rawNodes: rawNode[] = JSON.parse(await readFileAsync(`${__dirname}/assets/story.json`, { encoding: 'utf8' }));
    let nodes = new Array<Node>();

    rawNodes.forEach((rawNode) => {
        console.log("detecting type of node " + rawNode.cell)
        let type = detectType(rawNode);
        console.debug("node " + rawNode.cell + " type: " + type)

        console.log("Generating prompt of node " + rawNode.cell)
        let prompt = generatePrompt(rawNode);
        console.debug("node " + rawNode.cell + " prompt: " + prompt)
        nodes.push(new Node(rawNode, type, prompt))
    })

    getCredentials().then((credentials) => {
        const client = new Client(credentials);
        client.connect((err) => {
            if (err) throw err;
            console.log("Connected!");
        });

        client.query(generateQuery(nodes));
        client.end();
    }

    );


}
