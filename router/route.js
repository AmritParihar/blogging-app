const express = require("express");
const {
  RegisterBlogger,
  FindAccForForgotPass,
  LoginBlogger,
  VerifyOTP,
  setNewPassword,
  getCitiesByState,
  getStates,
} = require("../controller/userController");
const router = express.Router();
// User routes
router.post("/BloggerRegi", RegisterBlogger);
router.post("/setNewPassword", setNewPassword);
router.post("/verifyedOTP", VerifyOTP);
router.post("/BloggerLogin", LoginBlogger);
router.get("/states", getStates);
router.get("/cities/:stateId", getCitiesByState);
//find account for forgot password
router.post("/findAcountForForgotPass", FindAccForForgotPass);

module.exports = router;
