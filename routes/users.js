const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

router.get("/", ensureLoggedIn, async (req, res, next) => {
	try {
		let users = await User.all();
		return res.json({ users });
	} catch (err) {
		return next(err);
	}
});

router.get("/:username", ensureCorrectUser, async (req, res, next) => {
	try {
		const username = req.params.username;
		let user = await User.get(username);
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
	try {
		const username = req.params.username;
		const messages = await User.messagesTo(username);
		return res.json({ messages });
	} catch (err) {
		return next(err);
	}
});

router.get("/:username/from", ensureCorrectUser, async (req, res, next) => {
	try {
		const username = req.params.username;
		const messages = await User.messagesFrom(username);
		return res.json({ messages });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
