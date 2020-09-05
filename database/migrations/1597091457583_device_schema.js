"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class DeviceSchema extends Schema {
  up() {
    this.create("devices", (table) => {
      table.increments();
      table.string("mac_address", 12).notNullable().unique();
      table.string("description");
      table.timestamps();
    });
  }

  down() {
    this.drop("devices");
  }
}

module.exports = DeviceSchema;
