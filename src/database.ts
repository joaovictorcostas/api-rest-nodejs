import { knex as setupKnex } from 'knex'

export const config = {
  client: 'sqlite3',
  connection: {
    filename: './tmp/app.sqlite',
  },
  useNullAsDefault: true,
}

export const knex = setupKnex(config)
