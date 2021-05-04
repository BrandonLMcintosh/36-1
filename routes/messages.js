const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message");
const ExpressError = require("../expressError");
const { authenticateJWT } = require("../middleware/auth");

router.get("/:id", authenticateJWT, async (req, res, next) => {
	try {
		const id = req.params.id;
		const message = await Message.get(id);
		if (req.user.username != message.from_username || req.user.username !== message.to_username) {
			throw new ExpressError("Unauthorized", 400);
		}
		return res.json({ message });
	} catch (err) {
		return next(err);
	}
});

router.post("/", authenticateJWT, async (req, res, next) => {
	try {
		const { from_username } = req.body;
		if (req.user.username !== from_username) {
			throw new ExpressError("You cannot send a message as another user", 400);
		}
		const message = await Message.create(req.body);
		return res.json({ message });
	} catch (err) {
		return next(err);
	}
});

router.post("/:id/read", authenticateJWT, async (req, res, next) => {
	try {
		const id = req.params.id;
		const message = await Message.get(id);
		if (req.user !== message.to_username) {
			throw new ExpressError("unauthorized", 400);
		}
		const readMessage = await Message.markRead(id);
		return res.json({ readMessage });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
