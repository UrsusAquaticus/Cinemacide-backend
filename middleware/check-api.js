const HttpError = require("../models/http-error");

const { readStats, dumpStats } = require("../util/local-storage");

const maxRequestsPerMinute = 100000 / 24 / 60;

module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") {
		return next();
	}

    let { apiCount, expDate } = readStats();

    try {
        apiCount = apiCount + 1 || 1;
        console.log("API Request: #" + apiCount);

        expDate = expDate || new Date().getTime() + 1000 * 60;

        const remainingTime = new Date(expDate).getTime() - new Date().getTime();
        if (remainingTime <= 0) {
            console.log("Api Count Refreshed");
            apiCount = 0;
            expDate = new Date().getTime() + 1000 * 60;
        }

        dumpStats({ apiCount, expDate });

        if (apiCount > maxRequestsPerMinute) {
            console.log("Api request limit exceeded.");
            throw new Error("Api request limit exceeded.");
        }

        next();
    } catch (err) {
        const error = new HttpError(err, 429);
        return next(error);
    }
};
