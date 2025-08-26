import fs from "fs";
import fetch from "node-fetch";
import OpenAI from "openai";

const guardianApiKey = process.env.GUARDIAN_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

const client = new OpenAI({ apiKey: openaiApiKey });

async function fetchGuardianNews() {
  const url = `https://content.guardianapis.com/search?api-key=${guardianApiKey}&show-fields=thumbnail,trailText&page-size=5&order-by=newest`;
  const res = await fetch(url);
  const data = await res.json();
  return data.response.results;
}

async function summarize(text) {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: `Summarize this news in 3 lines:\n${text}` }],
  });
  return completion.choices[0].message.content.trim();
}

async function main() {
  const articles = await fetchGuardianNews();
  const summaries = [];

  for (const a of articles) {
    const summary = await summarize(a.fields.trailText || a.webTitle);
    summaries.push({
      title: a.webTitle,
      url: a.webUrl,
      image: a.fields?.thumbnail,
      summary,
      published: a.webPublicationDate,
    });
  }

  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync("public/news.json", JSON.stringify(summaries, null, 2));
}

main().catch(err => {
  console.error("Error in ingest:", err);
  process.exit(1);
});
