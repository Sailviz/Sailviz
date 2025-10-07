import { NextRequest, NextResponse } from "next/server";

const jwt = require('jsonwebtoken');

const jwtSecret = process.env.jwtSecret;

export async function GET(request: NextRequest) {
	const req = await request.json()

	if (!req.cookies) {
		return NextResponse.json({ error: true, message: 'No previous login found' });
	}
	let decoded: any;
	const token = req.cookies.token;
	if (token) {
		try {
			decoded = jwt.verify(token, jwtSecret);
		} catch (e) {
			return NextResponse.json({ error: true, message: 'Login has Expired' });
		}
	}

	if (decoded) {
		return NextResponse.json({ error: false, cookie: decoded });
	} else {
		return NextResponse.json({ error: true, message: 'Unable to auth' });
	}
}
