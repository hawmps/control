import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  item_type: text('item_type'),
  owner: text('owner'),
  criticality: text('criticality'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull()
});

export const securityControls = sqliteTable('security_controls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull()
});

export const subControls = sqliteTable('sub_controls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  control_id: integer('control_id').notNull().references(() => securityControls.id),
  name: text('name').notNull(),
  description: text('description'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull()
});

export const controlImplementations = sqliteTable('control_implementations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  item_id: integer('item_id').notNull().references(() => items.id),
  control_id: integer('control_id').notNull().references(() => securityControls.id),
  status: text('status').notNull(), // 'red', 'yellow', 'green'
  notes: text('notes'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull()
});

export const subControlImplementations = sqliteTable('sub_control_implementations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  item_id: integer('item_id').notNull().references(() => items.id),
  sub_control_id: integer('sub_control_id').notNull().references(() => subControls.id),
  status: text('status').notNull(), // 'red', 'yellow', 'green'
  notes: text('notes'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull()
});

// Relations
export const itemsRelations = relations(items, ({ many }) => ({
  controlImplementations: many(controlImplementations),
  subControlImplementations: many(subControlImplementations),
}));

export const securityControlsRelations = relations(securityControls, ({ many }) => ({
  controlImplementations: many(controlImplementations),
  subControls: many(subControls),
}));

export const subControlsRelations = relations(subControls, ({ one, many }) => ({
  control: one(securityControls, {
    fields: [subControls.control_id],
    references: [securityControls.id],
  }),
  subControlImplementations: many(subControlImplementations),
}));

export const subControlImplementationsRelations = relations(subControlImplementations, ({ one }) => ({
  item: one(items, {
    fields: [subControlImplementations.item_id],
    references: [items.id],
  }),
  subControl: one(subControls, {
    fields: [subControlImplementations.sub_control_id],
    references: [subControls.id],
  }),
}));

export const controlImplementationsRelations = relations(controlImplementations, ({ one }) => ({
  item: one(items, {
    fields: [controlImplementations.item_id],
    references: [items.id],
  }),
  control: one(securityControls, {
    fields: [controlImplementations.control_id],
    references: [securityControls.id],
  }),
}));