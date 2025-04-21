// pages/api/ask.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { prompt } = req.body;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const json = await openaiRes.json();

    console.log("🔍 OpenAI raw response:", JSON.stringify(json, null, 2));

    const reply = json.choices?.[0]?.message?.content?.trim() || "Sorry, I didn't quite catch that. Could you rephrase it?";

    // Example logic to extract "goal" or "reminder" based on prompt — you can make this smarter later.
    let goal = null;
    let reminder = null;
    let time = null;

    if (/goal|want to|plan to/i.test(prompt)) {
      goal = prompt;
    }
    if (/remind|reminder|remember/i.test(prompt)) {
      reminder = prompt;
      time = new Date().toLocaleTimeString();
    }

    res.status(200).json({ reply, goal, reminder, time });
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({ reply: "Something went wrong. Please try again later." });
  }
}
