const jwt = require('jsonwebtoken');
import type { NextApiRequest, NextApiResponse } from 'next'

const jwtSecret = process.env.jwtSecret;

const CheckAutentication = (req: NextApiRequest, res: NextApiResponse) => {
	console.log(req.cookies)
	if (req.method === 'GET') {
		if (!req.cookies) {
			res.json({ error: true, message: 'No previous login found' });
			return;
		}
		let decoded: any;
		const token = req.cookies.token;
		if (token) {
			try {
				decoded = jwt.verify(token, jwtSecret);
			} catch (e) {
				res.json({ error: true, message: 'Login has Expired' });
				return;
			}
		}

		if (decoded) {
			res.json({ error: false, cookie: decoded });
			return;
		} else {
			res.json({ error: true, message: 'Unable to auth' });
		}
	}
};

export default CheckAutentication