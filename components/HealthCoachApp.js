import { useState } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

export default function HealthCoachApp() {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [goals, setGoals] = useState([]);
  const [reminders, setReminders] = useState([]);

  const fetchGPTResponse = async (text) => {
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      setResponse(data.reply);
      if (data.goal) {
        setGoals((prev) => [...prev, { text: data.goal, done: false }]);
      }
      if (data.reminder) {
        setReminders((prev) => [...prev, { text: data.reminder, time: data.time }] );
      }

      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(data.reply);
      synth.speak(utterance);

    } catch (error) {
      console.error('Error fetching response:', error);
    }
  };

  const handleInputChange = (e) => {
    setTranscript(e.target.value);
  };

  const handleSend = () => {
    if (transcript.trim()) {
      fetchGPTResponse(transcript);
    }
  };

  const markGoalDone = (index) => {
    const updatedGoals = [...goals];
    updatedGoals[index].done = true;
    setGoals(updatedGoals);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-xl font-semibold">🎤 Talk to Your Coach</h2>
          <div className="flex gap-2">
            <Input
              type="text"
              value={transcript}
              onChange={handleInputChange}
              placeholder="Tap microphone on your keyboard to speak"
              autoFocus
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
          <h3 className="text-lg font-medium">🧠 Coach Says:</h3>
          <Textarea value={response} readOnly placeholder="AI response will show here" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-xl font-semibold">📌 Your Goals</h2>
          {goals.map((goal, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className={goal.done ? 'line-through text-gray-500' : ''}>{goal.text}</span>
              {!goal.done && (
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => markGoalDone(i)}
                >
                  Done
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {reminders.length > 0 && (
        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-xl font-semibold">⏰ Reminders</h2>
            {reminders.map((r, i) => (
              <div key={i}>{r.text} at {r.time}</div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
