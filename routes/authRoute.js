const userController = require('../controllers/auth.js');

const express = require("express");
const router = express.Router();

router.get("/",(req, res) => {
    return res.json({
        data: "Hello World from API"
    })
})


router.post("/signup", userController.signup);
router.post("/login", userController.login);

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);
// router.post("/update-password", updatePassword);

module.exports = router;