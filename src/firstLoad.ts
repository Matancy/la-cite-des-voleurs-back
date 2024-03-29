import { promisify } from 'util';
import fs from 'fs';
import { Client } from 'pg';
import { levenshtein } from './Levenshtein';
import { getCredentials } from './credentials';
const readFileAsync = promisify(fs.readFile)


class NodeType {
    static readonly DICE:Type = {keyword:"lancez", type: "dice"};
    static readonly DICE_EXPRESSION:Type = {keyword:"lancez xxxx dés", type: "dice"};
    static readonly LUCK:Type = {keyword: "chance", type: "dice"};
    static readonly LUCK_EXPRESSION:Type = {keyword: "tentez votre chance", type: "dice"}
    static readonly CHOICE:Type = {keyword: "allez-vous", type: "choice"};
    static readonly FIGHT:Type = {keyword: "battez", type: "fight"};
    static readonly DIRECT_LINK = {keyword: "", type: "directLink"};
    static readonly END:Type = {keyword:"", type: "end"};
}

type rawNode = {
    cell: string,
    text: string,
    links: number[]
}

type Type = {keyword: string, type: string}


class Node {
    cell: string;
    text: string;
    type: string;
    links: number[];

    constructor(rawNode: rawNode, type: string){
        this.cell = rawNode.cell;
        this.links = rawNode.links;
        this.text = rawNode.text;
        this.type = type;
    }
}



function detectType(rawNode: rawNode) {

    if (rawNode.links.length == 0) {
        return NodeType.END.type
    }

    let maximumScore = 5;
    let detectedType: Type;
    let conflict = false;

    const isOfType = (word: string, type: Type) =>{
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
    if(sentences[sentences.length -1].trim() === "") sentences.pop();

    sentences.forEach((sentence)=>{
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
            throw new Error("Could not detect type of node. Rework node "+ rawNode.cell)
        }
    } while (conflict)

    if(detectedType != NodeType.FIGHT && rawNode.links.length == 1){
        detectedType = NodeType.DIRECT_LINK;
    }

    return detectedType.type;


}


export async function firstLoad() {
    let rawNodes: rawNode[] = JSON.parse(await readFileAsync(`${__dirname}/assets/story.json`, { encoding: 'utf8' }));
    let nodes = new Array<Node>();

    rawNodes.forEach((rawNode) => {
        console.log("detecting type of node " + rawNode.cell)
        let type = detectType(rawNode);
        console.log("node " + rawNode.cell + " type: " + type)

        nodes.push(new Node(rawNode, type))
    })
    getCredentials().then((credentials) => {
        const client = new Client(credentials);
    }

    );


}
