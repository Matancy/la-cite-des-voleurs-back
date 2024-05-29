import { NodeType } from "../enums/nodeType"

export type rawNode = {
    cell: string,
    text: string,
    links: number[],
    type?: NodeType
}