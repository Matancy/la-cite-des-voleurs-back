import { Pool } from "pg";
import { getCredentials } from "./credentials";
import { SELECT_QUERY_BASE, SET_SCHEMA } from "./databaseScripts";
import { normalizeText } from './utils';
import { levenshtein } from "./Levenshtein";
import { Node } from "./models/node";
import { KeywordToType } from "./models/keywordToType";
import { DiceField } from "./enums/diceField";
import { NodeType } from "./enums/nodeType";
import { getType } from "./getType";
const IMAGES_URL = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZKk-vFG2wqWysYJw6R7Kbgwmd9jmCUg0tx_JdkDWgTBdfKWrcMMShZvi79CGNeWmXOBE&usqp=CAU",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRU7aI2HS_LBTQNnXA93FW6pz0dk6gNf_Gp8jiI_rRCg2MpksMpqAJDXRlTne0OP47MNtQ&usqp=CAU",
    "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/131151753/original/dc3a9417e1c41a63417fa291969251706dc501eb/draw-a-bad-version-of-your-d-and-d-character.jpg",
    "https://cdn.drawception.com/images/panels/2013/6-23/8Kd7KEws8z-6.png"
]

const FOE_MAX_STATS = 10;
const FOE_MIN_STATS = 5;
const COST_KEYWORD = "pieces";
const DOR = "d'or";
const HABILITY_FOE_FIELD = "%habilete%";
const STAMINA_FOE_FIELD = "%endurance%";


function callAPI(prompt: string) {
    //bipboupbip
    return IMAGES_URL[Math.floor(Math.random() * IMAGES_URL.length)];
}

function jsonBase(node: Node) {
    return `
        "id": "${node.cell}",
        "type": "${node.type}",
        "text": "${node.text}",
        "imageURL": "${callAPI(node.prompt)}"
    `
}

function generateEnd(node: Node) {
    return JSON.parse(`{
        ${jsonBase(node)}
    }`)
}

async function generateDirectLink(node: Node) {
    return JSON.parse(`{
        ${jsonBase(node)},
        "nextNode": {
            "id": "${node.links[0]}",
            "type": "${await getType(node.links[0])}"
        }
    }`)
}

function generateStats() {
    return Math.floor(Math.random() * (FOE_MAX_STATS - FOE_MIN_STATS + 1) + FOE_MIN_STATS)
}


async function generateFight(node: Node) {
    const hability = generateStats();
    const stamina = generateStats();

    return JSON.parse(`{
        ${jsonBase(node).replace(HABILITY_FOE_FIELD, hability.toString()).replace(STAMINA_FOE_FIELD, stamina.toString())},
        "nextNode": {
            "id": "${node.links[0]}",
            "type": "${await getType(node.links[0])}"
        },
        "foeHability": "${hability}",
        "foeStamina":"${stamina}"
    }`)
}


function detectChoices(text: string): string {
    let index = 0;
    const rectifiedText = normalizeText(text);
    const words = rectifiedText.split(" ")
    for (let word of words) {
        let score = levenshtein(word, KeywordToType.CHOICE.keyword);
        if (score < 5) {
            break;
        } else {
            index++;
        }
    }
    return rectifiedText.slice(rectifiedText.indexOf(words[index]), rectifiedText.length);
}

async function generateChoices(node: Node) {
    let json = `{
        ${jsonBase(node)},
        "links": [
    `;

    const choiceString: string = detectChoices(node.text);
    const choices = choiceString.split(".");
    if (choices[choices.length - 1].trim() === "") choices.pop();
    let choiceIndex = 0;
    for (let choice of choices){
        const words = choice.split(" ");
        let index = 0;
        let cost = 0;
        for (let word of words) {
            let score = levenshtein(word, COST_KEYWORD);
            if (score < 5 && words[index + 1] === DOR) {
                cost = Number(words[index - 1]);
                break;
            } else {
                index++;
            }
        }
        json += `{"cost" : "${cost}", "id": "${node.links[choiceIndex]}","type": "${await getType(node.links[choiceIndex])}"},`
        choiceIndex++;
    }



    return await JSON.parse(json.slice(0, json.length - 1) + "]}");
}

function getDiceField(text: string) {
    const sentences = normalizeText(text).split(".");
    for (let sentence of sentences) {
        let score = levenshtein(sentence, KeywordToType.LUCK_EXPRESSION.keyword);
        if (score < 10) {
            return DiceField.LUCK;
        }
    }
    return DiceField.HABILITY;

}

async function generateDice(node: Node) {
    const diceField = getDiceField(node.text);

    return JSON.parse(`{
        ${jsonBase(node)},
        "action": {
            "field": "${(diceField === DiceField.LUCK) ? DiceField.LUCK : DiceField.HABILITY}",
            "success": {
                "id": "${node.links[0]}",
                "type": "${await getType(node.links[0])}"
            },
            "fail": {
                "id": "${node.links[1]}",
                "type": "${await getType(node.links[1])}"
            }
        }
    }`)
}

export async function getPage(index: number): Promise<JSON> {

    let credentials = await getCredentials();

    const client = new Pool(credentials);

    const query = SELECT_QUERY_BASE.replace("%s", index.toString())

    return await client.query(SET_SCHEMA + query).then((res) => {
        client.end();
        let node: Node = res[1].rows[0]["node_data"];
        switch (node.type) {
            case NodeType.END: {
                return generateEnd(node);
            }
            case NodeType.DIRECT_LINK: {
                return generateDirectLink(node);
            }
            case NodeType.FIGHT: {
                return generateFight(node);
            }
            case NodeType.DICE: {
                return generateDice(node);
            }
            case NodeType.CHOICE: {
                return generateChoices(node);
            }
            default: {
                throw new Error("Could not get the node type.");

            }
        }
    })
}