"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class UserSchema extends Schema {
  up() {
    this.create("users", (table) => {
      table.increments();
      table.string("email", 254).notNullable().unique();
      table.boolean("email_verified").defaultTo(false);
      table.string("first_name", 80).notNullable();
      table.string("last_name", 80).notNullable();
      table.string("password", 60).notNullable();
      table.timestamps();
    });
  }

  down() {
    this.drop("users");
  }
}

module.exports = UserSchema;
