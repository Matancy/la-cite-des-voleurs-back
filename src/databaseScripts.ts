export const SET_SCHEMA = " SET SCHEMA 'sae';"
export const RESET_SCHEMA = "DROP SCHEMA IF EXISTS sae CASCADE; CREATE SCHEMA sae;" + SET_SCHEMA;
export const CREATE_TABLE = `
    CREATE TABLE node(
        cell int PRIMARY KEY UNIQUE NOT NULL,
        text varchar(10000) NOT NULL,
        type varchar(50) NOT NULL,
        prompt varchar(1000) NOT NULL
    );

    CREATE TABLE links(
        id_src_node int NOT NULL,
        id_next_node int NOT NULL,
        PRIMARY KEY (id_src_node, id_next_node),
        FOREIGN KEY(id_src_node) REFERENCES node(cell),
        FOREIGN KEY(id_next_node) REFERENCES node(cell)
    );
`;
export const INSERT_NODE_QUERY_BASE = "INSERT INTO node (cell, text, type, prompt) VALUES %s ;";

export const INSERT_LINKS_QUERY_BASE = "INSERT INTO links (id_src_node, id_next_node) VALUES %s ;";

export const SELECT_QUERY_BASE = `
SELECT json_build_object(
    'cell', n.cell,
    'text', n.text,
    'type', n.type,
    'prompt', n.prompt,
    'links', json_agg(l.id_next_node)
) AS node_data
FROM node n
LEFT JOIN links l ON n.cell = l.id_src_node
WHERE n.cell = %s
GROUP BY n.cell, n.text, n.type, n.prompt;
`