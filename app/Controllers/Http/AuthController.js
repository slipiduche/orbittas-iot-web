"use strict";

const { validate } = use("Validator");
const { flashAndRedirect } = use("App/Helpers");
const User = use("App/Models/User");
const PasswordReset = use("App/Models/PasswordReset");
const Mail = use("Mail");
const Env = use("Env");
const Hash = use("Hash");
const jwt = require("jsonwebtoken");
const Device = use("App/Models/Device");

class AuthController {
  async resetPassword({ response, request, session }) {
    const validation = await validate(request.all(), {
      token: "required",
      password: "required|confirmed",
    });

    if (validation.fails()) {
      session
        .withErrors(validation.messages())
        .flashExcept(["password", "password_confirmation"]);
      return response.redirect("back");
    }
    let payload;
    try {
      payload = jwt.verify(request.input("token"), Env.get("SECRET"));
    } catch (error) {
      if (error) {
        return flashAndRedirect(
          "danger",
          "link is Invalid or has expired!",
          "/login",
          {
            session,
            response,
          }
        );
      }
    }

    const user = await User.findBy("email", payload.email);
    if (!user) {
      return flashAndRedirect("danger", "user not found!", "back", {
        session,
        response,
      });
    }

    const passwordReset = await PasswordReset.query()
      .where("email", user.email)
      .where("token", request.input("token"))
      .first();

    if (!passwordReset) {
      return flashAndRedirect(
        "danger",
        "password reset request not found!",
        "/login",
        {
          session,
          response,
        }
      );
    }

    user.password = request.input("password");
    await user.save();

    await passwordReset.delete();

    return flashAndRedirect(
      "success",
      "password successfully changed!",
      "/login",
      {
        session,
        response,
      }
    );
  }
  async deviceSendResetEmail({ request, response, session }) {
    const validation = await validate(request.all(), {
      email: "required|email",
    });

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll();
      return {
        "Error": true,
        "message": "Email requerido",

      };
    }

    const user = await User.findBy("email", request.input("email"));
    if (!user) {
      return {
        "Error": true,
        "message": "El usuario no existe",

      };
    }

    await PasswordReset.query().where("email", user.email).delete();

    const token = jwt.sign({ email: user.email }, Env.get("SECRET"), {
      expiresIn: 60 * 60 * 24 * 3,
    });

    await PasswordReset.create({
      email: user.email,
      token,
    });

    const params = {
      ...user.toJSON(),
      token,
      appUrl: Env.get("APP_URL"),
    };

    await Mail.send("emails.reset_password", params, (message) => {
      message
        .to(user.email)
        .from(Env.get("FROM_EMAIL"))
        .subject("Reset Your Password!");
    });

    return {
      "Error": false,
      "message": "Verifica en tu correo para restablecer tu contraseña",

    };
  }

  async sendResetEmail({ request, response, session }) {
    const validation = await validate(request.all(), {
      email: "required|email",
    });

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll();
      return response.redirect("back");
    }

    const user = await User.findBy("email", request.input("email"));
    if (!user) {
      return flashAndRedirect(
        "success",
        "if the email is valid, you should receive an email!",
        "/login",
        {
          session,
          response,
        }
      );
    }

    await PasswordReset.query().where("email", user.email).delete();

    const token = jwt.sign({ email: user.email }, Env.get("SECRET"), {
      expiresIn: 60 * 60 * 24 * 3,
    });

    await PasswordReset.create({
      email: user.email,
      token,
    });

    const params = {
      ...user.toJSON(),
      token,
      appUrl: Env.get("APP_URL"),
    };

    await Mail.send("emails.reset_password", params, (message) => {
      message
        .to(user.email)
        .from(Env.get("FROM_EMAIL"))
        .subject("Reset Your Password!");
    });

    return flashAndRedirect(
      "success",
      "if the email is valid, you should receive an email",
      "/login",
      {
        session,
        response,
      }
    );
  }

  async logout({ auth, response }) {
    await auth.logout();

    return response.redirect("/");
  }

  async login({ session, request, response, auth }) {
    const validation = await validate(request.all(), {
      email: "required",
      password: "required",
    });

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept(["password"]);
      return response.redirect("back");
    }

    const user = await User.findBy("email", request.input("email"));
    if (!user) {
      return flashAndRedirect(
        "danger",
        "no user account found with this email",
        "back",
        {
          session,
          response,
        }
      );
    }

    if (!user.email_verified) {
      return flashAndRedirect(
        "danger",
        "please verify your email first",
        "back",
        {
          session,
          response,
        }
      );
    }

    const isSame = await Hash.verify(request.input("password"), user.password);
    if (!isSame) {
      return flashAndRedirect("danger", "incorrect credentials", "back", {
        session,
        response,
      });
    }

    await auth.login(user);

    return response.redirect("/deviceSelector");
  }

  async resendConfirmationEmail({ request, response, session }) {
    const validation = await validate(request.all(), {
      email: "required|email",
    });

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll();
      return response.redirect("back");
    }

    const user = await User.findBy("email", request.input("email"));
    if (!user) {
      return flashAndRedirect(
        "success",
        "if the email is valid, you should receive an email!",
        "/login",
        {
          session,
          response,
        }
      );
    }

    if (user.email_verified) {
      return flashAndRedirect("danger", "account already verified!", "/login", {
        session,
        response,
      });
    }

    const token = jwt.sign({ email: user.email }, Env.get("SECRET"), {
      expiresIn: 60 * 60 * 24 * 3,
    });

    const params = {
      ...user.toJSON(),
      token,
      appUrl: Env.get("APP_URL"),
    };

    await Mail.send("emails.confirm_account", params, (message) => {
      message
        .to(user.email)
        .from(Env.get("FROM_EMAIL"))
        .subject("Confirm your Account!");
    });

    return flashAndRedirect(
      "success",
      "if the email is valid, you should receive an email!",
      "/login",
      {
        session,
        response,
      }
    );
  }

  async confirmAccount({ response, params, session }) {
    const { token } = params;

    let payload;
    try {
      payload = await jwt.verify(token, Env.get("SECRET"));
    } catch (err) {
      return flashAndRedirect(
        "danger",
        "Link is Invalid or it has expired!",
        "/login",
        {
          session,
          response,
        }
      );
    }

    const user = await User.findBy("email", payload.email);
    if (!user) {
      return flashAndRedirect("danger", "user not found", "/login", {
        session,
        response,
      });
    }

    if (user.email_verified) {
      return response.redirect("/login");
    }

    user.email_verified = true;
    await user.save();

    return flashAndRedirect(
      "success",
      "account confirmed successfully",
      "/login",
      {
        session,
        response,
      }
    );
  }

  async signup({ session, request, response }) {
    const validation = await validate(request.all(), {
      email: "required|email",
      firstName: "required",
      lastName: "required",
      password: "required|min:4",
    });

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept(["password"]);
      return response.redirect("back");
    }

    const userFound = await User.findBy("email", request.input("email"));
    if (userFound) {
      return flashAndRedirect(
        "danger",
        "an account already exists with this email",
        "back",
        {
          session,
          response,
        }
      );
    }

    const user = await User.create({
      email: request.input("email"),
      first_name: request.input("firstName"),
      last_name: request.input("lastName"),
      password: request.input("password"),
      email_verified: false,
    });

    const token = jwt.sign({ email: user.email }, Env.get("SECRET"), {
      expiresIn: 60 * 60 * 24 * 3,
    });

    const params = {
      ...user.toJSON(),
      token,
      appUrl: Env.get("APP_URL"),
    };

    await Mail.send("emails.confirm_account", params, (message) => {
      message
        .to(user.email)
        .from(Env.get("FROM_EMAIL"))
        .subject("Confirm your Account!");
    });

    return flashAndRedirect(
      "success",
      "please check your email to confirm the account",
      "/login",
      {
        session,
        response,
      }
    );
  }
  async confirmDevice({ response, request, session, params }) {
    let token = request.input("token");
    console.log(params);
    console.log(token);
    if (token == null) {
      token = params["token"];
    }
    console.log(token);
    let payload;
    try {
      payload = await jwt.verify(token, Env.get("SECRET"));
    } catch (err) {
      console.log(err);
      return {
        "Error": true,
        "message": "Sesion Invalida o Expirada.",

      };
    }

    const user = await User.findBy("email", payload.email);
    if (!user) {
      return {
        "Error": true,
        "message": "Usuario no existe",

      };
    }

    const devices = await Device.query()
      .whereHas("users", (builder) => {
        builder.wherePivot("user_id", user.id);
      })
      .fetch();



    return {
      "Error": false,
      "message": "Conectado.",
      "user": user.email,
      "userId": user.id,
      "firstName": user.first_name,
      "dispositivos": devices

    };
  }
  async deviceLogin({ session, request, response, auth }) {
    const validation = await validate(request.all(), {
      email: "required",
      password: "required",
    });

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept(["password"]);
      return {
        "Error": true,
        "message": "Todos los campos requeridos.",

      };
    }

    const user = await User.findBy("email", request.input("email"));
    if (!user) {
      return {
        "Error": true,
        "message": "El usuario no existe.",

      };
    }

    if (!user.email_verified) {
      return {
        "Error": true,
        "message": "Verifica tu email primero.",

      };
    }

    const isSame = await Hash.verify(request.input("password"), user.password);
    if (!isSame) {
      return {
        "Error": true,
        "message": "Usuario o clave incorrecta",

      };
    }

    console.log(user.email);
    console.log(user.password);
    const token = jwt.sign({ email: user.email, }, Env.get("SECRET"), {
      expiresIn: 60 * 60 * 24 * 3,
    });
    console.log(token);
    return {

      "Error": false,
      "message": "Conectado.",
      "user": user.email,
      "userId": user.id,
      "firstName": user.first_name,
      "token": token,

    };
  }
  async deviceSignup({ session, request, response }) {
    const validation = await validate(request.all(), {
      email: "required|email",
      firstName: "required",
      lastName: "required",
      password: "required|min:4",
    });

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept(["password"]);
      return {
        "Error": true,
        "message": "Todos los campos son requeridos."
      };
    }

    const userFound = await User.findBy("email", request.input("email"));
    if (userFound) {
      return {
        "Error": true,
        "message": "Usuario existente."
      };
    }


    const user = await User.create({
      email: request.input("email"),
      first_name: request.input("firstName"),
      last_name: request.input("lastName"),
      password: request.input("password"),
      email_verified: false,
    });

    const token = jwt.sign({ email: user.email }, Env.get("SECRET"), {
      expiresIn: 60 * 60 * 24 * 3,
    });

    const params = {
      ...user.toJSON(),
      token,
      appUrl: Env.get("APP_URL"),
    };

    await Mail.send("emails.confirm_account", params, (message) => {
      message
        .to(user.email)
        .from(Env.get("FROM_EMAIL"))
        .subject("Confirm your Account!");
    });

    return {
      "Error": false,
      "message": "Confirma tu cuenta"
    };

  }
  async deviceUserUpdate({ session, request, response }) {

   console.log(request.input("email"));
    const user = await User.findBy("email", request.input("email"));
    if (user) {
      
      const nombre=request.input("firstName");
      console.log(nombre);
      user.first_name=nombre;
      try {
        
        await user.save();
        console.log(user.first_name);
        return {
          "Error": false,
          "message": "Usuario actualizado"
        };

      } catch (error) {
        return {
          "Error": true,
          "message": "error procesando"
        };

      }

    }
    else
      return {
        "Error": true,
        "message": "No se logro actualizar no existe el usuario"
      };

  }
}

module.exports = AuthController;
