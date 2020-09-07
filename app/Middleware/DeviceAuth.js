'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const jwt = require("jsonwebtoken");
const User = use("App/Models/User");
const Env = use("Env");
class DeviceAuth {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request,params,response }, next) {
    // call next to advance the request
    let token  = request.input("token");
    console.log(params);
    console.log(token);
    if(token==null)
    {
      token =params["token"];
    }
    console.log(token);
    if(token==null)
    {console.log('no posee token');
    
      return response.status(404).send({
        "Error": true,
        "message": "No posee un token.",

      });
      
      
    }
    let payload;
    try {
      payload = await jwt.verify(token, Env.get("SECRET"));
    } catch (err) {
      console.log(err);
      return response.status(404).send({
        "Error": true,
        "message": "Sesion invalida o token expirado.",

      });
      //await next();
    }

    const user = await User.findBy("email", payload.email);
    if (!user) {
       return response.status(404).send({
        "Error": true,
        "message": "Usuario no existe",

      });
     // await next();
    }
    await next()
  }
}

module.exports = DeviceAuth
