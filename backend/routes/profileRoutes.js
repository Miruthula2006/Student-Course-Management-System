const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const controller = require("../controllers/profileController");

const router = express.Router();
router.use(authenticateToken);
router.get("/", controller.getProfile);
router.put("/", controller.updateProfile);

module.exports = router;