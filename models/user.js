const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {
	static async register({ username, password, first_name, last_name, phone }) {
		let hash = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const res = await db.query(
			`INSERT INTO users 
      (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
			[username, hash, first_name, last_name, phone]
		);

		return res.rows[0];
	}

	static async authenticate(username, password) {
		const res = await db.query(
			`SELECT password
      FROM users
      WHERE username = $1`,
			[username]
		);

		let user = res.rows[0];
		return user && (await bcrypt.compare(password, user.password));
	}

	static async updateLoginTimestamp(username) {
		const res = await db.query(
			`UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username`,
			[username]
		);
		if (!res.rows[0]) {
			throw new ExpressError(`User ${username} does not exist`, 404);
		}
	}

	static async all() {
		const res = await db.query(
			`SELECT username, first_name, last_name, phone
      FROM users
      ORDER BY username`
		);
		return res.rows;
	}

	static async get(username) {
		const res = await db.query(
			`SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`,
			[username]
		);

		if (!res.rows[0]) {
			throw new ExpressError(`User ${username} does not exist`, 404);
		}

		return res.rows[0];
	}

	static async messagesFrom(username) {
		const res = await db.query(
			`SELECT m.id, m.to_username, u.first_name, u.last_name, u.phone, m.body, m.sent_at, m.read_at
      FROM messages as m
      JOIN users as u
      ON m.to_username = u.username
      WHERE from_username = $1`,
			[username]
		);

		return res.rows.map((message) => ({
			id: message.id,
			to_user: {
				username: message.to_username,
				first_name: message.first_name,
				last_name: message.last_name,
				phone: message.phone,
			},
			body: message.body,
			sent_at: message.sent_at,
			read_at: message.read_at,
		}));
	}

	static async messagesTo(username) {
		const res = await db.query(
			`SELECT m.id, m.from_username, u.first_name, u.last_name, u.phone, m.body, m.sent_at, m.read_at
      FROM messages as m
      JOIN users as u
      ON m.from_username = u.username
      WHERE to_username = $1`,
			[username]
		);
		return res.rows.map((message) => ({
			id: message.id,
			from_user: {
				username: message.from_username,
				first_name: message.first_name,
				last_name: message.last_name,
				phone: message.phone,
			},
			body: message.body,
			sent_at: message.sent_at,
			read_at: message.read_at,
		}));
	}
}

module.exports = User;
