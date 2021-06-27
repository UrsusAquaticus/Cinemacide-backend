const express = require("express");
const { check } = require("express-validator");

const reviewsControllers = require("../controllers/reviews-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", reviewsControllers.getReviews);

router.get("/:rid", reviewsControllers.getReviewById);

router.get("/user/:uid", reviewsControllers.getReviewsByUserId);

router.get("/movie/:mid", reviewsControllers.getReviewsByMovieId);

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
	reviewsControllers.createReview
);

router.patch(
	"/:rid",
	[check("rating").not().isEmpty(), check("comment").isLength({ min: 10 })],
	reviewsControllers.updateReview
);

router.delete("/:rid", reviewsControllers.deleteReview);

module.exports = router;
