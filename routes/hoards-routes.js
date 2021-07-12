const express = require("express");
const { check } = require("express-validator");

const hoardsControllers = require("../controllers/hoards-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", hoardsControllers.getHoards);

router.get("/:cid", hoardsControllers.getHoardById);

router.get("/user/:uid", hoardsControllers.getHoardsByUserId);

router.get("/movie/:mid", hoardsControllers.getHoardsByMovieId);

//Protected below
router.use(checkAuth);

router.post(
	"/",
	[
		check("imdbID").not().isEmpty(),
		check("title").not().isEmpty(),
		check("rating").not().isEmpty(),
		check("comment").isLength({ min: 10 }),
		check("creator").not().isEmpty(),
	],
	hoardsControllers.createHoard
);

router.patch(
	"/:cid",
	[check("rating").not().isEmpty(), check("comment").isLength({ min: 10 })],
	hoardsControllers.updateHoard
);

router.delete("/:cid", hoardsControllers.deleteHoard);

module.exports = router;
