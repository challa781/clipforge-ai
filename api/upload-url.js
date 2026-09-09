export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      "https://api.shotstack.io/ingest/stage/upload",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-api-key": process.env.SHOTSTACK_API_KEY
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Could not create upload URL"
    });
  }
}
