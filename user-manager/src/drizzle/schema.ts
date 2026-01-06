import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import { primaryKey, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

// Note: Drizzle defaults to the name given for columns.
// We only explicitly add a string to convert camelCase to snake_case.
// For example: profilePic: text("profile_picture_path")

export const users = table("users",
  {
    google_id: text("google_id").unique().notNull(),
    id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
    username: text().notNull(),
    profilePic: text("profile_picture_path").default("./defaultPic"),
  }
);

// Note 1: in refenceTables, we refer to the IDs of entries in other tables 
// using a callback, so the type of the given entry will already be compiled. 
// Note 2: the somewhat funky syntax with the primaryKey() callback as a second 
// argument to the table() method is done in order to combine the IDs of the 
// two entries we are linking here. That way we are sure that the two entries 
// are unique and there is no redundant ID column.

export const friendsReferenceTable = table("friends_reference_table",
  {
    user1_id: integer({ mode: 'number' }).references((): SQLiteColumn => users.id),
    user2_id: integer({ mode: 'number' }).references((): SQLiteColumn => users.id),
  }, (table) => [
    primaryKey({ columns: [table.user1_id, table.user2_id] })
  ]
);

export const games = table("games",
  {
    id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
    winnerID: integer({ mode: 'number' }),
    loserID: integer({ mode: 'number' }),
    scoreWinner: integer({ mode: 'number' }),
    scoreLoser: integer({ mode: 'number' }),
    started: integer({ mode: 'timestamp' }),
    finished: integer({ mode: 'timestamp' }),
    isFinished: integer({ mode: 'boolean' }),
  }
);

// Note: for each game-user relation, we make a entries. 
// That means a simple game with two playes has two entries.

export const gameReferenceTable = table("games_reference_table",
  {
    user_id: integer({ mode: 'number' }).references((): SQLiteColumn => users.id),
    game_id: integer({ mode: 'number' }).references((): SQLiteColumn => games.id)
  }, (table) => [
    primaryKey({ columns: [table.user_id, table.game_id] })
  ]
);

export const images = table("images",
  {
    id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
    orientation: text().notNull(),
    intendedUse: text(),
  }
);

export const picturesReferenceTable = table("picturesReferenceTable",
  {
    user_id: integer({ mode: 'number' }).references((): SQLiteColumn => users.id),
    image_id: integer({ mode: 'number' }).references((): SQLiteColumn => images.id)
  }, (table) => [
    primaryKey({ columns: [table.user_id, table.image_id] })
  ]
);
