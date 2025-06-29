import React, { useEffect, useState } from "react";
import { Button } from "./components/ui/button.jsx";
import { Card, CardContent } from "./components/ui/card.jsx";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Veterinary Flashcards Trainer
 * – mehrere Benutzer
 * – Spaced Repetition
 * – lokaler Speicher
 */

// --------------------------------------------------
// 1) In dieser Datei steckt nur ein AUSZUG der Karten.
//    Die komplette Liste liegt gleich in allCardsData.js
// --------------------------------------------------
import { cardsData as cardsSeed } from "./allCardsData";

// --------------------------------------------------
// 2) Hilfsfunktionen Speicher & Benutzer
// --------------------------------------------------
const KEY_PREFIX = "vetFlashcards_";
const CURRENT_USER_KEY = "vetFlash_currentUser";

function storageKey(user) {
  return `${KEY_PREFIX}${user}`;
}
function saveCards(user, cards) {
  localStorage.setItem(storageKey(user), JSON.stringify(cards));
}
function loadCards(user) {
  const raw = localStorage.getItem(storageKey(user));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
function existingUsers() {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(KEY_PREFIX))
    .map((k) => k.replace(KEY_PREFIX, ""));
}

// --------------------------------------------------
// 3) Komponenten
// --------------------------------------------------
function UserSelect({ onSelect }) {
  const [name, setName] = useState("");
  const users = existingUsers();

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSelect(name.trim());
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-12">
      <h1 className="text-3xl font-bold">Sachkunde-Trainer Katze</h1>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Benutzername"
          className="border rounded px-3 py-2"
        />
        <Button type="submit">Start</Button>
      </form>

      {users.length > 0 && (
        <>
          <p className="mt-6">Vorhandenen Nutzer wählen:</p>
          <div className="flex flex-wrap gap-2">
            {users.map((u) => (
              <Button key={u} variant="secondary" onClick={() => onSelect(u)}>
                {u}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FlashcardTrainer({ user, onLogout }) {
  const [cards, setCards] = useState(() => loadCards(user) || cardsSeed);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyAhead, setStudyAhead] = useState(false);

  const now = Date.now();
  const dueCards   = cards.filter((c) => c.due <= now);
  const nextSoonest = [...cards].sort((a, b) => a.due - b.due)[0];
  const current    = dueCards.length ? dueCards[0] : studyAhead ? nextSoonest : null;

  useEffect(() => saveCards(user, cards), [cards, user]);

  function grade(g) {
    if (!current) return;
    const factor = g === 3 ? 2.5 : g === 2 ? 1.5 : 1;
    const newInt = current.interval
      ? Math.max(1, Math.round(current.interval * factor))
      : g === 1 ? 1 : g === 2 ? 2 : 4;
    const nextDue = now + newInt * 86400000;

    setCards((prev) =>
      prev.map((c) => (c.id === current.id ? { ...c, interval: newInt, due: nextDue } : c))
    );
    setShowAnswer(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-100">
      <div className="w-full max-w-xl flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Benutzer: {user}</h2>
        <Button variant="outline" onClick={onLogout}>Benutzer wechseln</Button>
      </div>

      <p className="mb-2 text-sm text-gray-600">
        Fällige Karten: {dueCards.length} / {cards.length}
      </p>

      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.id + (showAnswer ? "A" : "Q")}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="w-full max-w-xl"
          >
            <Card className="shadow-xl">
              <CardContent className="p-6 text-lg">
                <strong>Frage {current.id}</strong>
                {!showAnswer ? (
                  <p>{current.q}</p>
                ) : (
                  <>
                    <p className="font-medium text-green-700 mt-4">Antwort:</p>
                    <p>{current.a}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center mt-10">
            <p className="text-xl mb-4">Alle fälligen Karten erledigt – super! 🎉</p>
            {cards.length > 0 && (
              <Button onClick={() => setStudyAhead(true)}>Weitere Fragen jetzt üben</Button>
            )}
          </div>
        )}
      </AnimatePresence>

      {current && !showAnswer && (
        <Button className="mt-4" onClick={() => setShowAnswer(true)}>Antwort anzeigen</Button>
      )}

      {current && showAnswer && (
        <div className="flex gap-4 mt-4">
          <Button onClick={() => grade(1)} variant="destructive">Schwer</Button>
          <Button onClick={() => grade(2)} variant="secondary">Mittel</Button>
          <Button onClick={() => grade(3)}>Leicht</Button>
        </div>
      )}
    </div>
  );
}

export default function VetFlashcardsApp() {
  const [user, setUser] = useState(() => localStorage.getItem(CURRENT_USER_KEY) || null);
  const login   = (u) => { setUser(u); localStorage.setItem(CURRENT_USER_KEY, u); };
  const logout  = () => { setUser(null); localStorage.removeItem(CURRENT_USER_KEY); };
  return user ? <FlashcardTrainer user={user} onLogout={logout} /> : <UserSelect onSelect={login} />;
}
