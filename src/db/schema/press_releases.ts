import { sqliteTable, integer , text} from "drizzle-orm/sqlite-core";

export const press_releases = sqliteTable('press_releases', {
  id: text(),
})