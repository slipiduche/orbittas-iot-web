"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Device extends Model {
  static get hidden() {
    return ["created_at", "updated_at"];
  }
  users() {
    return this.belongsToMany("App/Models/User");
  }
}

module.exports = Device;
