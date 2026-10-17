import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const recipes = sqliteTable('recipes', {id: text('id').primaryKey(), data: text('data').notNull()});
export const samples = sqliteTable('samples', {id: text('id').primaryKey(), recipeId: text('recipe_id').notNull(), owner: text('owner').notNull(), createdAt: integer('created_at').notNull()});
export const favorites = sqliteTable('favorites', {id: text('id').primaryKey(), owner: text('owner').notNull(), recipeId: text('recipe_id').notNull()});
