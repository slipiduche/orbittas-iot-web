"use strict";

const User = use("App/Models/User");
const { flashAndRedirect } = use("App/Helpers");
const Device = use("App/Models/Device");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with devices
 */
class DeviceController {
  /**
   * Show a list of all devices.
   * GET devices
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {}

  /**
   * Render a form to be used for creating a new device.
   * GET devices/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {}

  /**
   * Create/save a new device.
   * POST devices
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, auth, session }) {
    const { mac_address, description } = request.post();
    const user = await User.findBy("id", auth.user.id);
    try {
      await user.devices().create({ mac_address, description });
      return flashAndRedirect("success", "Mac Address registered", "back", {
        session,
        response,
      });
    } catch (error) {
      session.withErrors([{ mac_address }]).flashAll();
      if (error.code == "ER_DUP_ENTRY")
        return flashAndRedirect(
          "danger",
          "Mac Address Already Registered",
          "back",
          {
            session,
            response,
          }
        );
      else
        return flashAndRedirect("danger", error.code, "back", {
          session,
          response,
        });
    }
  }
  async deviceStore({ request, response, params, session }) {
    const { mac_address, description, userId} = request.all();
    console.log(userId);
    const user = await User.findBy("id", userId);
    try {
      await user.devices().create({ mac_address, description });
      return {
      
        "Error": false,
        "message": "Almacenado",
          
      };
    } catch (error) {
      session.withErrors([{ mac_address }]).flashAll();
      if (error.code == "ER_DUP_ENTRY")
        return {
      
          "Error": true,
          "message": "chipId existente",
            
        };
      else
        return {
      
          "Error": true,
          "message": error.code,
            
        };
    }
  }

  /**
   * Display a single device.
   * GET devices/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Render a form to update an existing device.
   * GET devices/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, view }) {}

  /**
   * Update device details.
   * PUT or PATCH devices/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async deviceUpdate({ params, request, response, auth, session }) {
    console.log(params.userId);
    const { mac_address, description, userId, deviceId} = request.all();
    const user = await User.findBy("id", userId);
    
    try {
      await user.devices().where("id", deviceId).update({ "mac_address":mac_address,"description":description  });
      return {
      
        "Error": false,
        "message": "Actualizado",
          
      };
    } catch (error) {
      return {
      
        "Error": true,
        "message": error.code,
          
      };
    }
  }

  /**
   * Delete a device with id.
   * DELETE devices/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async deviceDestroy({ params, request, response, auth, session }) {
    console.log(params.userId);
    const { mac_address, description, userId} = request.all();
    const user = await User.findBy("id", userId);
    try {
      await user.devices().where("mac_address", mac_address).delete();
      return {
      
        "Error": false,
        "message": "Eliminado",
          
      };
    } catch (error) {
      return {
      
        "Error": true,
        "message": error.code,
          
      };
    }
  }
  async destroy({ params, request, response, auth, session }) {
    const user = await User.findBy("id", auth.user.id);
    try {
      await user.devices().where("mac_address", params.mac_address).delete();
      return flashAndRedirect("success", "Mac Address Deleted", "back", {
        session,
        response,
      });
    } catch (error) {
      return flashAndRedirect("danger", error.code, "back", {
        session,
        response,
      });
    }
  }
  async delete({ params, response, auth }) {}
}

module.exports = DeviceController;
