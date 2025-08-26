import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const guardianKey = process.env.GUARDIAN_API_KEY;

    // Fetch latest Guardian news
    const response = await fetch(
      `https://content.guardianapis.com/search?api-key=${guardianKey}&show-fields=thumbnail,trailText&page-size=10&order-by=newest`
    );
    const json = await response.json();

    const articles = json.response.results.map(item => ({
      title: item.webTitle,
      url: item.webUrl,
      image: item.fields?.thumbnail || "",
      summary: item.fields?.trailText || ""
    }));

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
