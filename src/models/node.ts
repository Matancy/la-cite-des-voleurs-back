import { NodeType } from "../enums/nodeType";
import { rawNode } from "./rawNode";

export class Node {
    cell: string;
    text: string;
    type: NodeType;
    prompt: string;
    links: number[];

    constructor(rawNode: rawNode, type: NodeType, prompt: string) {
        this.cell = rawNode.cell;
        this.links = rawNode.links;
        this.text = rawNode.text;
        this.type = type;
        this.prompt = prompt;
    }

    public toNodeDBTable() {
        return "(" + this.cell + ", '" + this.text.replace(/'/g, "''") + "','" + this.type + "','" + ((this.prompt != null) ? this.prompt.replace(/'/g, "''") : "none") + "')";
    }

    public toLinksDBTable() {
        let query: string = "";
        this.links.forEach((link) => {
            query += "(" + this.cell + "," + link + "),"
        })
        return query;
    }
}