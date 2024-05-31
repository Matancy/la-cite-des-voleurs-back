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

    CREATE TABLE character(
        name varchar(20) PRIMARY KEY UNIQUE NOT NULL,
        hability int NOT NULL,
        stamina int NOT NULL,
        luck int NOT NULL,
        gold int NOT NULL
    );

    CREATE TABLE users(
        login varchar(20) PRIMARY KEY UNIQUE NOT NULL,
        password varchar(500) NOT NULL,
        statistics text
    );
`;
export const INSERT_NODE_QUERY_BASE = "INSERT INTO node (cell, text, type, prompt) VALUES %s ;";

export const INSERT_LINKS_QUERY_BASE = "INSERT INTO links (id_src_node, id_next_node) VALUES %s ;";

export const RESET_CHARACTER_WITH_BASE = "TRUNCATE TABLE character; INSERT INTO character (name, hability, stamina, luck, gold) VALUES %s ;"

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
export const SELECT_CHARACTER = `
SELECT json_build_object(
    'name', c.name,
    'hability', c.hability,
    'stamina', c.stamina,
    'luck', c.luck,
    'gold', c.gold
) AS character
FROM character c;
`

export const SELECT_NODE_TYPE_BASE = "SELECT type FROM node WHERE node.cell = %s ;"

export const CREATE_USER_BASE = "INSERT INTO users (login, password, statistics) VALUES %s ;"
export const SELECT_USER_BASE = "SELECT statistics FROM users WHERE users.login = '%1s' AND users.password = '%2s' ;"
export const UPDATE_USER_BASE = "UPDATE users SET statistics = '%1s' WHERE login = '%2s' ;"