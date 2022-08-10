const jwt = require('jsonwebtoken');
import type { NextApiRequest, NextApiResponse } from 'next'

const jwtSecret = process.env.jwtSecret;

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    if (!req.cookies) {
      res.status(401).json({message: 'No previous login found'});
      return;
    }
    let decoded: any;
    const token = req.cookies.token;
    if (token) {
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (e) {
        res.status(401).json({message: 'Login has Expired'});
        return;
      }
    }

    if (decoded) {
      res.json(decoded);
      return;
    } else {
      res.status(401).json({message: 'Unable to auth'});
    }
  }
};