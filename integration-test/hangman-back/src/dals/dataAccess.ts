import { Knex, knex } from "knex";

export let db: Knex;

type PgConnectionConfig = { 
    host: string, 
    user: string, 
    password: string,
    port: number,
    database: string, 
};

type ConnectionParams = PgConnectionConfig & { dbVersion: string };

export const startConnection = ({ dbVersion: version, ...connection }: ConnectionParams) => {
    try {
        db = knex({
            client: 'pg',
            version,
            connection
        })
    } catch (error) {
        throw error;
    }
};
