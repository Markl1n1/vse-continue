export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const payload = req.body;

  fetch("https://script.google.com/macros/s/AKfycbyPZ0Z0mW7Jx3LduwvyAPhiZmRiW7fIfQYpMkBw0wuhv03_6QD7uROa0J4cuwhTUTasUw/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then(response => response.json())
    .then(data => res.status(200).json(data))
    .catch(error => res.status(500).json({ message: "Error", error: error.message }));
}