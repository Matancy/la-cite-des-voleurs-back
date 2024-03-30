export const DROP_QUERIES = "DROP TABLE IF EXISTS node CASCADE; DROP TABLE IF EXISTS links CASCADE;";
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