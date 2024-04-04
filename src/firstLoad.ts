import { promisify } from 'util';
import fs from 'fs';
import { Pool } from 'pg';
import { levenshtein } from './Levenshtein';
import { getCredentials } from './credentials';
import { CREATE_TABLE, RESET_SCHEMA, INSERT_LINKS_QUERY_BASE, INSERT_NODE_QUERY_BASE } from './databaseScripts';
import { normalizeText } from './utils';
import { rawNode } from './models/rawNode';
import { KeywordToType, KeywordToTypeHolder } from './models/keywordToType';
import { Node } from './models/node';
const readFileAsync = promisify(fs.readFile)
const PROMPT_KEYWORD = "observe";


/* @here bonus */
/* Section type detection based on Levenshtein algorithm */
function detectType(rawNode: rawNode) {

    if (rawNode.links.length == 0) {
        return KeywordToType.END.type
    }

    let maximumScore = 5;
    let detectedType: KeywordToTypeHolder;
    let conflict = false;

    const isOfType = (word: string, type: KeywordToTypeHolder) => {
        let score = levenshtein(word, type.keyword);
        if (score < maximumScore) {
            if (detectedType != null && detectedType != type) {
                conflict = true;
            } else {
                detectedType = type
            }
        }

    }

    const sentences = normalizeText(rawNode.text).split(".");
    if (sentences[sentences.length - 1].trim() === "") sentences.pop();

    sentences.forEach((sentence) => {
        let score = levenshtein(sentence.trim(), KeywordToType.DICE_EXPRESSION.keyword);
        if (score < 10) {
            return KeywordToType.DICE_EXPRESSION.type
        }

        score = levenshtein(sentence.trim(), KeywordToType.LUCK_EXPRESSION.keyword);
        if (score < 10) {
            return KeywordToType.LUCK_EXPRESSION.type
        }
    })

    do {
        conflict = false;
        detectedType = null;

        sentences.forEach((sentence) => {
            const words = sentence.split(" ");
            words.forEach((word) => {
                isOfType(word, KeywordToType.DICE)
                isOfType(word, KeywordToType.LUCK)
                isOfType(word, KeywordToType.FIGHT)
                isOfType(word, KeywordToType.CHOICE)
            })
        })
        if (conflict) {
            maximumScore--;
        }
        if (maximumScore <= 0) {
            throw new Error("Could not detect type of node. Rework node " + rawNode.cell)
        }
    } while (conflict)

    if (detectedType != KeywordToType.FIGHT && rawNode.links.length == 1) {
        detectedType = KeywordToType.DIRECT_LINK;
    }

    return detectedType.type;
}

/* @here */
/* generate the prompt to send send to the API */
function generatePrompt(rawNode: rawNode) {
    let maximalScore = 4;
    let sentenceToReturn: string = null
    const sentences = normalizeText(rawNode.text).split(".");
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

function generateQuery(nodes: Array<Node>) {
    let insertNodeQuery: string = "";
    let insertLinksQuery: string = "";

    nodes.forEach((node) => {
        insertNodeQuery += node.toNodeDBTable() + ",";
        insertLinksQuery += node.toLinksDBTable();
    })
    insertNodeQuery = INSERT_NODE_QUERY_BASE.replace("%s", insertNodeQuery.substring(0, insertNodeQuery.length - 1));
    insertLinksQuery = INSERT_LINKS_QUERY_BASE.replace("%s", insertLinksQuery.substring(0, insertLinksQuery.length - 1));

    return RESET_SCHEMA.concat(CREATE_TABLE, insertNodeQuery, insertLinksQuery);
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
        const client = new Pool(credentials);

        client.query(generateQuery(nodes));
        client.end();
    });
}
