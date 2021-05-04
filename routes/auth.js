const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body;
		if (await User.authenticate(username, password)) {
			const token = jwt.sign({ username }, SECRET_KEY);
			User.updateLoginTimestamp(username);
			return res.json({ token });
		} else {
			throw new ExpressError("Invalid login", 400);
		}
	} catch (err) {
		return next(err);
	}
});

router.post("/register", async (req, res, next) => {
	try {
		const { username } = await User.register(req.body);
		const token = jwt.sign({ username }, SECRET_KEY);
		User.updateLoginTimestamp(username);
		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
