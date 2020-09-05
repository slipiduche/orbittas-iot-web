"use strict";
const Device = use("App/Models/Device");
const User = use("App/Models/User");
const DB = use("Database");

class PageController {
  showHome({ view }) {
    return view.render("home");
  }

  showSignup({ view }) {
    return view.render("signup");
  }

  showLogin({ view }) {
    return view.render("login");
  }

  showResendConfirm({ view }) {
    return view.render("resend_confirm");
  }

  showDashboard({ view }) {
    return view.render("dashboard");
  }

  async showDashboardOfMac({ view, params, response, auth }) {
    try {
      const selectedDevice = await Device.findByOrFail(
        "mac_address",
        params.mac_address
      );
      const currentUser = await User.find(auth.user.id);
      const pivot = await currentUser
        .devices()
        .wherePivot("device_id", selectedDevice.id)
        .fetch();

      if (pivot.toJSON()[0].pivot.user_id == currentUser.id)
        return view.render("dashboard");
      else return response.status(404).send("You don't have premissions");
    } catch (error) {
      return response.status(404).send("Not Found on DB or not authorized");
    }
  }

  async test({ response, auth }) {
    try {
      const selectedDevice = await Device.findByOrFail(
        "mac_address",
        "404dd7286f2"
      );

      const query = await selectedDevice
        .users()
        .wherePivot("id", auth.user.id)
        .fetch();

      return query.toJSON();
    } catch (error) {
      throw error;
    }
  }

  showRegisterMac({ view }) {
    return view.render("mac_register");
  }

  showForgotPassword({ view }) {
    return view.render("forgot_password");
  }

  showPasswordReset({ view, params }) {
    return view.render("reset_password", {
      token: params.token,
    });
  }
  async showDeviceSelector({ view, auth }) {
    const devices = await Device.query()
      .whereHas("users", (builder) => {
        builder.wherePivot("user_id", auth.user.id);
      })
      .fetch();
    return view.render("device_selector", {
      devices: devices.toJSON(),
    });
  }
  async showDeleteSelector({ view, auth }) {
    const devices = await Device.query()
      .whereHas("users", (builder) => {
        builder.wherePivot("user_id", auth.user.id);
      })
      .fetch();
    return view.render("delete_selector", {
      devices: devices.toJSON(),
    });
  }
}

module.exports = PageController;
