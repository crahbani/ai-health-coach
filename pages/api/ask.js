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
    const reply = json.choices?.[0]?.message?.content;

    let goal = null;
    let reminder = null;
    let time = null;

    if (prompt.toLowerCase().includes("goal")) {
      goal = prompt;
    }
    if (prompt.toLowerCase().includes("remind")) {
      reminder = prompt;
      time = new Date().toLocaleTimeString();
    }

    res.status(200).json({ reply, goal, reminder, time });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "GPT failed" });
  }
}
