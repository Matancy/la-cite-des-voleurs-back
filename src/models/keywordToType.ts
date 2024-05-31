import { NodeType } from "../enums/nodeType";

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
    static readonly RIDDLE : KeywordToTypeHolder = { keyword: "énigme", type: NodeType.RIDDLE};
}