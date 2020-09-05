"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class DeviceUserSchema extends Schema {
  up() {
    this.create("device_user", (table) => {
      table
        .integer("user_id")
        .unsigned()
        .index("user_id")
        .references("id")
        .inTable("users")
        .onDelete("cascade");
      table
        .integer("device_id")
        .unsigned()
        .index("device_id")
        .references("id")
        .inTable("devices")
        .onDelete("cascade");
    });
  }

  down() {
    this.drop("device_user");
  }
}

module.exports = DeviceUserSchema;
