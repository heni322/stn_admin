import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Mock authentication (replace with real logic)
    const { email, password } = req.body;

    if (email === 'user@example.com' && password === 'password') {
      // Mock user data (replace with actual user data from DB)
      const user = { id: '1', name: 'John Doe', email: 'user@example.com' };

      return res.status(200).json({ user });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
