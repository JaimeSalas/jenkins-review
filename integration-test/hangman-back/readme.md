# Hangman

## Solución paso a paso

```bash
npm init -y
```

Como dependencia de producción en nuestro código vamos a tener `knex`

```bash
npm i knex pg chance
```

Como dependencias de desarrollo

```bash
npm i dotenv jest typescript ts-jest @types/jest @types/chance -D
```

Añadimos `tsconfig.json`

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true,
    "strict": true,
    "target": "es2019"
  }
}

```

Creamos la conexión contra la base de datos, `src/dals/dataAccess.ts`:

```ts
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

```

Creamos las `entities`.

Creamos la **dal** `games`

Creamos los servicios `word-provider`


## Test unitarios

Para los test unitarios usaremos `jest`, a fin de segregar test unitarios y de integarción, utilizaremos dos ficheros de configuración.

Crear en el raíz del proyecto `jest.config.specification.js`

```js
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/?(*.)+(spec).+(ts|js)'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};
```

Creamos el fichero de test `,/src/services/word-provider.srv.spec.ts`

```ts
import { setUp, selectWord, WordCategory } from './word-provider.srv';

describe('word-provider.srv', () => {
  test('returns a valid selectedWord', () => {
    // Arrange
    const categories = [
      {
        category: 'clothes',
        words: ['pants', 't-shirt'],
      },
      {
        category: 'sports',
        words: ['football', 'f1'],
      },
    ];

    const categoryLength = categories.length;
    const wordCategories: WordCategory[] = categories.map((c, index) => ({
      categoryId: index,
      categoryLength: c.words.length,
    }));

    setUp(categoryLength, wordCategories);

    // Act
    const selectedWord = selectWord();
    expect(selectedWord.categoryIndex).toBeLessThanOrEqual(categoryLength - 1);
    expect(selectedWord.wordIndex).toBeLessThanOrEqual(categories[selectedWord.categoryIndex].words.length - 1);
  });
});

```

Para lanzarlo actualizamos `package.json`

```diff
"scripts": {
+ "pretest": "jest --clearCache",
+ "test": "jest --config=jest.config.specification.js"
},
```

```bash
npm test
```

## Tests de integración 

Crear en el raíz del proyecto `jest.config.integration.js`

```js
require('dotenv').config({
    path: '.env.test'
});

module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/?(*.)+(test).+(ts|js)'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};

```

Crear `./src/dals/games/game.dal.test.ts`

```ts
import { db as knex, startConnection } from '../dataAccess';
import { GameEntity, PlayerEntity, WordEntity } from '../entities';
import { gameDALFactory } from './game.dal';

beforeAll(() => {
  startConnection({
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    port: +process.env.DATABASE_PORT!,
    database: process.env.DATABASE_NAME!,
    dbVersion: process.env.DATABASE_VERSION!,
  });
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  await knex.from('players').delete();
  await knex.from('words').delete();
  await knex.from('games').delete();
});

describe('game.dal', () => {
  describe('getGames', () => {
    test('returns the games related to a player', async () => {
      // Arrange
      await Promise.all([insertPlayer('joe', 1), insertWord(1, 'car', 'vehicles')]);
      await insertGame(1, 1, 'not_started');
      const gameDAL = gameDALFactory(knex);

      // Act
      const [game] = await gameDAL.getGames(1);
      const { player_id, word_id, game_state } = game;

      // Assert
      expect(player_id).toEqual(1);
      expect(word_id).toEqual(1);
      expect(game_state).toEqual('not_started');
    });
  });
});

const insertPlayer = (name: string, id: number): Promise<PlayerEntity> =>
  knex('players')
    .insert({ id, name }, '*')
    .then(([player]) => player);

const insertWord = (id: number, entry: string, word_category: string): Promise<WordEntity> =>
  knex('words')
    .insert({ id, entry, word_category }, '*')
    .then(([word]) => word);

const insertGame = (player_id: number, word_id: number, game_state: string): Promise<GameEntity> =>
  knex('games')
    .insert({ player_id, word_id, game_state }, '*')
    .then(([game]) => game);

```

Para poderlos lanzar actualizamos `package.json`

```diff
"scripts": {
  "pretest": "jest --clearCache",
  "test": "jest --config=jest.config.specification.js",
+ "pretest:integration": "jest --clearCache",
+ "test:integration": "jest --detectOpenHandles --config=jest.config.integration.js"
},
```

> Todavía no los podemos lanzar, antes debemos hacer todo el setup necesario con Docker.


## Inicializando Knex

El proyecto utilizará las migraciones de `Knex`

```bash
$(npm bin)/knex init
```

O a partir de la versión 5.2 de npm podemos usar

```bash
npx knex init
```


Esto creará un fichero `knexfile.js` con las especificaciones necesarias para conectar con la base de datos depiendo del entorno con el que queramos tarbajar.

Para alimentar los valores necesarios de la conexión con la base de datos vamos a utilizar una serie de variables de entorno:

```ini
DATABASE_PORT=
DATABASE_HOST=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_POOL_MIN=
DATABASE_POOL_MAX=
```

Creamos en el raíz del proyecto un fichero con las mismas, para ayudar a los usuarios del proyecto.

Crear `env.template`

```ini
# Ejemplo para local
DATABASE_PORT=5432
DATABASE_HOST=localhost
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=hangman_db
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

> Para ejecutar los siguientes pasos debemos tener alimentadas las variables de entorno. Simplemente añadir el fichero .env al raíz, para que `dotenv` pueda cargarlas.


Haciendo uso de las variables anteriores, vamos a actualizar `knexfile.js`

```js
require('dotenv').config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      port: process.env.DATABASE_PORT,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD
    },
    pool: {
      min: +process.env.DATABASE_POOL_MIN,
      max: +process.env.DATABASE_POOL_MAX
    }, 
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};

```

Ahora que tenemos `knexfile.js` definido, vamos a crear las tablas de nuestra base de datos a partir de **migracione**.

```bash
npx knex migrate:make create_initial_tables
```

Actualizamos ahora este fichero `./db/migrations/<timestamp>_create_initial_tables.js`

```js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('players', (table) => {
            table.increments();
            table.string('name').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
        .createTable('words', (table) => {
            table.increments();
            table.string('entry').notNullable();
            table.enu('word_category', ['clothes', 'sports', 'vehicles'], { useNative: true, enumName: 'category' });
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        }).createTable('games', (table) => {
            table.increments();
            table.integer('player_id').references('id').inTable('players');
            table.integer('word_id').references('id').inTable('words');
            table.enu('game_state', ['not_started', 'started', 'finished'], { useNative: true, enumName: 'progress' });
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('games').dropTable('words').dropTable('players');
};

```

Ya estaríamos listos para poder ejecutar las migraciones, pero para ello necesitamos una base de datos contra la que lanzarlas. 
