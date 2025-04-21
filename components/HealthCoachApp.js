import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export default function HealthCoachApp() {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [goals, setGoals] = useState([]);
  const [reminders, setReminders] = useState([]);

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      fetchGPTResponse(speechToText);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

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

      // Optional: Speak the AI response aloud
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(data.reply);
      synth.speak(utterance);

    } catch (error) {
      console.error('Error fetching response:', error);
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
          <Button onClick={startListening} disabled={isListening}>
            {isListening ? 'Listening...' : 'Speak'}
          </Button>
          <Textarea value={transcript} readOnly placeholder="Your spoken text will appear here" />
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
                <Button size="sm" onClick={() => markGoalDone(i)}>
                  Done
                </Button>
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
