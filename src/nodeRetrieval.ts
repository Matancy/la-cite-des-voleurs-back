import { Pool } from "pg";
import { getCredentials } from "./credentials";
import { SELECT_QUERY_BASE, SET_SCHEMA } from "./databaseScripts";
import { Node, rawNode, KeywordToType, KeywordToTypeHolder, NodeType, normalizeText, DiceField } from './utils';
import { levenshtein } from "./Levenshtein";
const IMAGES_URL = [
    "https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn.drawception.com%2Fimages%2Fpanels%2F2017%2F5-21%2FpKkCMdsbbp-1.png&tbnid=MBTyyLI6Dg5_6M&vet=12ahUKEwiGvee-op6FAxURTKQEHYQbC8AQMygAegQIARBU..i&imgrefurl=https%3A%2F%2Fdrawception.com%2Fgame%2FpKkCMdsbbp%2Fpoorly-drawn-house%2F&docid=O_0z--Rn3HYxFM&w=300&h=250&q=poorly%20drawn%20house&ved=2ahUKEwiGvee-op6FAxURTKQEHYQbC8AQMygAegQIARBU",
    "https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn.drawception.com%2Fimages%2Fpanels%2F2017%2F8-5%2F8CxrsC2ThD-2.png&tbnid=Y7AmNEkRdpd7AM&vet=12ahUKEwiK3_XMop6FAxUlcaQEHU6uChsQMygBegQIARBM..i&imgrefurl=https%3A%2F%2Fdrawception.com%2Fgame%2F8CxrsC2ThD%2Fbadly-drawn-soldier-very-detailed-weapon%2F&docid=_s8G6OkhKug67M&w=300&h=250&q=poorly%20drawn%20soldier&ved=2ahUKEwiK3_XMop6FAxUlcaQEHU6uChsQMygBegQIARBM",
    "https://www.google.com/imgres?imgurl=https%3A%2F%2Ffiverr-res.cloudinary.com%2Fimages%2Ft_main1%2Cq_auto%2Cf_auto%2Cq_auto%2Cf_auto%2Fgigs%2F131151753%2Foriginal%2Fdc3a9417e1c41a63417fa291969251706dc501eb%2Fdraw-a-bad-version-of-your-d-and-d-character.jpg&tbnid=Lr86v9O7AGHG2M&vet=12ahUKEwjrluTuo56FAxWhXaQEHaXjC6EQMygCegQIARBS..i&imgrefurl=https%3A%2F%2Fwww.fiverr.com%2Fmichaelgbt%2Fdraw-a-bad-version-of-your-d-and-d-character&docid=TwpKrfRhs9FDFM&w=680&h=349&q=poorly%20drawn%20D%26D&ved=2ahUKEwjrluTuo56FAxWhXaQEHaXjC6EQMygCegQIARBS",
    "https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn.drawception.com%2Fimages%2Fpanels%2F2013%2F6-23%2F8Kd7KEws8z-6.png&tbnid=59mS1UOvAao2CM&vet=12ahUKEwjQyqKKpJ6FAxVCV6QEHRNZCgQQMygHegQIARBj..i&imgrefurl=https%3A%2F%2Fdrawception.com%2Fgame%2F8Kd7KEws8z%2Fsin-city%2F&docid=gQVUqZGu0dyU3M&w=300&h=250&q=poorly%20drawn%20city&ved=2ahUKEwjQyqKKpJ6FAxVCV6QEHRNZCgQQMygHegQIARBj"

]

const FOE_MAX_STATS = 10;
const FOE_MIN_STATS = 5;
const COST_KEYWORD = "pieces";
const DOR = "d'or";
const HABILITY_FOE_FIELD = "%habilete%";
const STAMINA_FOE_FIELD = "%endurance%";


type ChoiceCost = { cost: number, nextNode: number }

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

function generateDirectLink(node: Node) {
    return JSON.parse(`{
        ${jsonBase(node)},
        "idOfNextNode": "${node.links[0]}"
    }`)
}

function generateStats() {
    return Math.floor(Math.random() * (FOE_MAX_STATS - FOE_MIN_STATS + 1) + FOE_MIN_STATS)
}


function generateFight(node: Node) {
    const hability = generateStats();
    const stamina = generateStats();

    return JSON.parse(`{
        ${jsonBase(node).replace(HABILITY_FOE_FIELD, hability.toString()).replace(STAMINA_FOE_FIELD, stamina.toString())},
        "idOfNextNode": "${node.links[0]}",
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

function generateChoices(node: Node) {
    let choicesCost: Array<ChoiceCost> = new Array<ChoiceCost>();

    const choiceString: string = detectChoices(node.text);
    const choices = choiceString.split(".");
    if (choices[choices.length - 1].trim() === "") choices.pop();

    choices.forEach((choice, choiceIndex) => {
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
        choicesCost.push({ cost, "nextNode": node.links[choiceIndex] })
    })


    let json = `{
        ${jsonBase(node)},
        "links": [
    `;
    choicesCost.forEach(choiceCost => {
        json = json.concat(`{"cost" : "${choiceCost.cost}", "nextNode":"${choiceCost.nextNode}"},`)
    })
    return JSON.parse(json.slice(0, json.length - 1) + "]}");
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

function generateDice(node: Node) {
    const diceField = getDiceField(node.text);

    return JSON.parse(`{
        ${jsonBase(node)},
        "action": {
            "field": "${(diceField === DiceField.LUCK) ? DiceField.LUCK : DiceField.HABILITY}",
            "success": "${node.links[0]}",
            "fail": "${node.links[1]}"
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