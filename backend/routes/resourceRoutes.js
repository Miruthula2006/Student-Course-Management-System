const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const controller = require("../controllers/resourceController");

const router = express.Router();
router.use(authenticateToken);
router.get("/courses/:courseId", controller.getCourseResources);
router.post("/courses/:courseId", authorizeRoles("admin"), controller.createResource);
router.put("/:resourceId", authorizeRoles("admin"), controller.updateResource);
router.delete("/:resourceId", authorizeRoles("admin"), controller.deleteResource);

module.exports = router;
