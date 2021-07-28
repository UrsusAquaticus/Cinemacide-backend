const express = require("express");
const { check } = require("express-validator");

const hoardsControllers = require("../controllers/hoards-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", hoardsControllers.getHoards);

router.get("/:hid", hoardsControllers.getHoardById);

router.get("/user/:uid", hoardsControllers.getHoardsByUserId);

router.get("/movie/:mid", hoardsControllers.getHoardsByMovieId);

//Protected below
router.use(checkAuth);

router.post(
	"/",
	[
		check("title").not().isEmpty(),
		check("public").toBoolean(),
	],
	hoardsControllers.createHoard
);

router.patch(
	"/:hid",
	[check("public").toBoolean()],
	hoardsControllers.updateHoard
);

router.delete("/:hid", hoardsControllers.deleteHoard);

module.exports = router;
