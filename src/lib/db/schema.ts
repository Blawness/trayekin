import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  serial,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const serviceTypeEnum = pgEnum("service_type", [
  "rutin",
  "besar",
  "lainnya",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "kir",
  "service",
  "stnk",
  "part",
]);

export const stnkTypeEnum = pgEnum("stnk_type", [
  "tahunan",
  "lima_tahunan",
  "asuransi",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plate: text("plate").notNull(),
  name: text("name"),
  stnkUrl: text("stnk_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  simNumber: text("sim_number"),
  simExpiry: date("sim_expiry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kirRecords = pgTable("kir_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  notes: text("notes"),
  cost: integer("cost").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceRecords = pgTable("service_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  serviceDate: date("service_date").notNull(),
  type: serviceTypeEnum("type").notNull().default("rutin"),
  notes: text("notes"),
  cost: integer("cost").default(0),
  nextServiceDate: date("next_service_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stnkRecords = pgTable("stnk_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  type: stnkTypeEnum("type").notNull().default("tahunan"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  notes: text("notes"),
  cost: integer("cost").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyLedger = pgTable("daily_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  driverId: uuid("driver_id").references(() => drivers.id, { onDelete: "set null" }),
  date: date("date").notNull(),
  revenue: integer("revenue").notNull().default(0),
  expenses: integer("expenses").notNull().default(0),
  notes: text("notes"),
  km: integer("km"),
  snapshotRatePerKm: integer("snapshot_rate_per_km"),
  snapshotFuelPrice: integer("snapshot_fuel_price"),
  snapshotFuelConsumption: integer("snapshot_fuel_consumption"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partReplacements = pgTable("part_replacements", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  partName: text("part_name").notNull(),
  cost: integer("cost").notNull().default(0),
  date: date("date").notNull(),
  odometer: integer("odometer"),
  lifespanMonths: integer("lifespan_months"),
  nextReplaceDate: date("next_replace_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  message: text("message").notNull(),
  isRead: timestamp("is_read"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cronLogs = pgTable("cron_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobName: text("job_name").notNull(),
  runAt: timestamp("run_at").defaultNow().notNull(),
  status: text("status").notNull(),
  recordsProcessed: integer("records_processed"),
  errorMessage: text("error_message"),
});

export const driverAssignments = pgTable("driver_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: uuid("driver_id")
    .notNull()
    .references(() => drivers.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
}, (table) => [
  unique("driver_assignments_unique").on(table.driverId, table.vehicleId, table.date),
]);

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  type: text("type").default("string"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("app_settings_user_key_unique").on(table.userId, table.key),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
  drivers: many(drivers),
  pushSubscriptions: many(pushSubscriptions),
  notifications: many(notifications),
  appSettings: many(appSettings),
  driverAssignments: many(driverAssignments),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  user: one(users, { fields: [vehicles.userId], references: [users.id] }),
  kirRecords: many(kirRecords),
  serviceRecords: many(serviceRecords),
  stnkRecords: many(stnkRecords),
  dailyLedger: many(dailyLedger),
  partReplacements: many(partReplacements),
  notifications: many(notifications),
  driverAssignments: many(driverAssignments),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, { fields: [drivers.userId], references: [users.id] }),
  dailyLedger: many(dailyLedger),
  driverAssignments: many(driverAssignments),
}));

export const kirRecordsRelations = relations(kirRecords, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [kirRecords.vehicleId],
    references: [vehicles.id],
  }),
}));

export const serviceRecordsRelations = relations(serviceRecords, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [serviceRecords.vehicleId],
    references: [vehicles.id],
  }),
}));

export const stnkRecordsRelations = relations(stnkRecords, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [stnkRecords.vehicleId],
    references: [vehicles.id],
  }),
}));

export const dailyLedgerRelations = relations(dailyLedger, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [dailyLedger.vehicleId],
    references: [vehicles.id],
  }),
  driver: one(drivers, {
    fields: [dailyLedger.driverId],
    references: [drivers.id],
  }),
}));

export const partReplacementsRelations = relations(partReplacements, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [partReplacements.vehicleId],
    references: [vehicles.id],
  }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [notifications.vehicleId],
    references: [vehicles.id],
  }),
}));

export const appSettingsRelations = relations(appSettings, ({ one }) => ({
  user: one(users, {
    fields: [appSettings.userId],
    references: [users.id],
  }),
}));

export const driverAssignmentsRelations = relations(driverAssignments, ({ one }) => ({
  driver: one(drivers, {
    fields: [driverAssignments.driverId],
    references: [drivers.id],
  }),
  vehicle: one(vehicles, {
    fields: [driverAssignments.vehicleId],
    references: [vehicles.id],
  }),
  user: one(users, {
    fields: [driverAssignments.userId],
    references: [users.id],
  }),
}));
