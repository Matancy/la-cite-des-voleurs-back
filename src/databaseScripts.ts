export const RESET_SCHEMA = "DROP SCHEMA IF EXISTS sae; CREATE SCHEMA sae; SET SCHEMA 'sae';";
export const CREATE_TABLE = `
    CREATE TABLE node(
        id int PRIMARY KEY UNIQUE NOT NULL,
        text varchar(10000) NOT NULL,
        type varchar(50) NOT NULL,
        prompt varchar(1000) NOT NULL
    );

    CREATE TABLE links(
        id_src_node int NOT NULL,
        id_next_node int NOT NULL,
        PRIMARY KEY (id_src_node, id_next_node),
        FOREIGN KEY(id_src_node) REFERENCES node(id),
        FOREIGN KEY(id_next_node) REFERENCES node(id)
    );
`;
export const INSERT_NODE_QUERY_BASE = "INSERT INTO node (id, text, type, prompt) VALUES %s ;";

export const INSERT_LINKS_QUERY_BASE = "INSERT INTO links (id_src_node, id_next_node) VALUES %s ;";

export const SELECT_QUERY_BASE = `
    SELECT json_build_object(
        'node', n,
        'links', json_agg(json_build_object(
                    'id_next_node', l.id_next_node
                ))
    )
    FROM node n
    LEFT JOIN links l ON n.id = l.id_src_node
    WHERE n.id = %s
    GROUP BY n;
`