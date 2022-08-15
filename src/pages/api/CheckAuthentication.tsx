const jwt = require('jsonwebtoken');
import type { NextApiRequest, NextApiResponse } from 'next'

const jwtSecret = process.env.jwtSecret;

export default (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		if (!req.cookies) {
			res.status(401).json({error: true, message: 'No previous login found'});
			return;
		}
		let decoded: any;
		const token = req.cookies.token;
		if (token) {
			try {
				decoded = jwt.verify(token, jwtSecret);
			} catch (e) {
				res.status(401).json({error: true, message: 'Login has Expired'});
				return;
			}
		}

		if (decoded) {
			res.json({error: false, cookie: decoded});
			return;
		} else {
			res.status(401).json({error: true, message: 'Unable to auth'});
		}
	}
};