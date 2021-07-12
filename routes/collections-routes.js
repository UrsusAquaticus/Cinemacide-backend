const express = require("express");
const { check } = require("express-validator");

const collectionsControllers = require("../controllers/collections-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", collectionsControllers.getCollections);

router.get("/:rid", collectionsControllers.getCollectionById);

router.get("/user/:uid", collectionsControllers.getCollectionsByUserId);

router.get("/movie/:mid", collectionsControllers.getCollectionsByMovieId);

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
	collectionsControllers.createCollection
);

router.patch(
	"/:rid",
	[check("rating").not().isEmpty(), check("comment").isLength({ min: 10 })],
	collectionsControllers.updateCollection
);

router.delete("/:rid", collectionsControllers.deleteCollection);

module.exports = router;
