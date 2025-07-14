import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const payload = req.body;
  console.log('Received payload:', payload);

  fetch('https://script.google.com/macros/s/AKfycbyPZ0Z0mW7Jx3LduwvyAPhiZmRiW7fIfQYpMkBw0wuhv03_6QD7uROa0J4cuwhTUTasUw/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(response => {
      console.log('Google Apps Script response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Google Apps Script response data:', data);
      res.status(200).json(data);
    })
    .catch(error => {
      console.error('Fetch error:', error.message);
      res.status(500).json({ message: 'Error', error: error.message });
    });
}