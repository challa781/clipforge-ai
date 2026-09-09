export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sources, format, style } = req.body || {};

    if (!Array.isArray(sources) || sources.length === 0) {
      return res.status(400).json({
        error: "At least one video source is required"
      });
    }

    const clips = sources.slice(0, 10).map((source, index) => ({
      asset: {
        type: "video",
        src: source.url || source
      },
      start: "auto",
      length: "auto",
      ...(index === 0 ? { transition: { in: "fade" } } : {})
    }));

    const aspectRatios = {
      "9:16": { width: 1080, height: 1920 },
      "16:9": { width: 1920, height: 1080 },
      "1:1": { width: 1080, height: 1080 }
    };

    const size = aspectRatios[format] || aspectRatios["9:16"];

    const edit = {
      timeline: {
        background: "#000000",
        tracks: [
          {
            clips
          }
        ]
      },
      output: {
        format: "mp4",
        size
      }
    };

    const response = await fetch(
      "https://api.shotstack.io/edit/stage/render",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": process.env.SHOTSTACK_API_KEY
        },
        body: JSON.stringify(edit)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      ...data,
      style: style || "Cinematic"
    });
  } catch (error) {
    return res.status(500).json({
      error: "Could not start video render"
    });
  }
}
