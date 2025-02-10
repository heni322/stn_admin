import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Handle logout logic here (e.g., clear cookies or invalidate token)
    res.status(200).json({ message: 'Logged out successfully' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
