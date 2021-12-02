const HttpError = require("../models/http-error");

const { readStats, dumpStats } = require("../util/local-storage");

//Keep under max get requests a day
//cap requests per hour
const maxCallsPerDay = 1000;
const refreshRate = 1000 * 60 * 60; // an hour
const maxRequestsPerRefresh = maxCallsPerDay / 24; //maxCalls / 24 hours

module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") {
		return next();
	}

    let { apiCount, expDate } = readStats();

    try {
        apiCount = apiCount + 1 || 1;
        console.log("API Request: #" + apiCount);

        expDate = expDate || new Date().getTime() + refreshRate;

        const remainingTime = new Date(expDate).getTime() - new Date().getTime();
        if (remainingTime <= 0) {
            console.log("Api Count Refreshed");
            apiCount = 0;
            expDate = new Date().getTime() + refreshRate;
        }

        dumpStats({ apiCount, expDate });

        if (apiCount > maxRequestsPerRefresh) {
            console.log("Api request limit exceeded. Try again Later.");
            throw new Error("Api request limit exceeded. Try again Later.");
        }

        next();
    } catch (err) {
        const error = new HttpError(err, 429);
        return next(error);
    }
};
