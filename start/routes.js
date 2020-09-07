"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

Route.group(() => {
  Route.get("/dashboard", "PageController.showDashboard");
  Route.get("/dashboard/:mac_address", "PageController.showDashboardOfMac");
  Route.get("/registerMac", "PageController.showRegisterMac");
  Route.post("/dashboard", ({ request, response }) => {
    response.redirect("/dashboard/" + request.post().deviceSelected);
  });
  Route.get("/deviceSelector", "PageController.showDeviceSelector");
  Route.get("/deleteDevice", "PageController.showDeleteSelector");
  Route.post("/deleteDevice", ({ request, response }) => {
    response.route("delete", { mac_address: request.post().deviceSelected });
  });
  Route.get("/devices/:mac_address/delete", "DeviceController.destroy").as(
    "delete"
  );
  Route.delete("/devices/:mac_address", "DeviceController.destroy");
}).middleware(["auth"]);

Route.group(() => {
  Route.get("/", "PageController.showHome");
  Route.get("/signup", "PageController.showSignup");
  Route.get("/login", "PageController.showLogin");
  Route.get("/confirm/resend", "PageController.showResendConfirm");
  Route.get("/password/reset/:token", "PageController.showPasswordReset");
  Route.get("/forgot/password", "PageController.showForgotPassword");
}).middleware(["authenticated"]);

Route.group(() => {
  Route.post("deviceSignup", "AuthController.deviceSignup");
  Route.post("signup", "AuthController.signup");
  Route.post("deviceLogin", "AuthController.deviceLogin");
  Route.post("login", "AuthController.login");
  Route.post("logout", "AuthController.logout");
  Route.post("password/reset/email", "AuthController.sendResetEmail");
  Route.post("password/reset", "AuthController.resetPassword");
  Route.get("confirm/:token", "AuthController.confirmAccount");
  Route.post("confirmDevice", "AuthController.confirmDevice");
  Route.get("confirmDevice/:token", "AuthController.confirmDevice");
  Route.post("confirm/resend", "AuthController.resendConfirmationEmail");
}).prefix("api/");

Route.group(() => {
  Route.get("/", "PageController.test");
  Route.post("/devices/store", "DeviceController.store");
  Route.delete("/devices/:mac_address", "DeviceController.destroy");
})
  .prefix("test/")
  .middleware(["auth"]);
  Route.group(() => {
   
    Route.post("deviceStore", "DeviceController.deviceStore");
    Route.delete("deviceDestroy", "DeviceController.deviceDestroy");
  })
    .prefix("api/")
    .middleware("deviceAuth");
