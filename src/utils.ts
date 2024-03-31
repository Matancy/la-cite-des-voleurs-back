export type rawNode = {
    cell: string,
    text: string,
    links: number[]
}

export enum DiceField { LUCK = "luck", HABILITY = "hability" }

export function normalizeText(text: string) {
    return text.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/%[^%]*%/g, ' ');
}

export enum NodeType {
    DICE = "dice",
    CHOICE = "choice",
    FIGHT = "fight",
    DIRECT_LINK = "directLink",
    END = "end"
}

export type KeywordToTypeHolder = { keyword: string, type: NodeType }

export class KeywordToType {
    static readonly DICE: KeywordToTypeHolder = { keyword: "lancez", type: NodeType.DICE };
    static readonly DICE_EXPRESSION: KeywordToTypeHolder = { keyword: "lancez xxxx dés", type: NodeType.DICE };
    static readonly LUCK: KeywordToTypeHolder = { keyword: "chance", type: NodeType.DICE };
    static readonly LUCK_EXPRESSION: KeywordToTypeHolder = { keyword: "tentez votre chance", type: NodeType.DICE }
    static readonly CHOICE: KeywordToTypeHolder = { keyword: "allez-vous", type: NodeType.CHOICE };
    static readonly FIGHT: KeywordToTypeHolder = { keyword: "battez", type: NodeType.FIGHT };
    static readonly DIRECT_LINK = { keyword: "", type: NodeType.DIRECT_LINK };
    static readonly END: KeywordToTypeHolder = { keyword: "", type: NodeType.END };
}

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

export class EndNode {
    readonly id: number;
    readonly text: string;
    readonly imageURL: URL;
}