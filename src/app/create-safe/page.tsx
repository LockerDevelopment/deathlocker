"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Key, Users, Clock } from "lucide-react";
import Cookies from "js-cookie";

type UnlockType = "time" | "vote";

export default function CreateSafePage() {
  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [cid, setCID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlockType, setUnlockType] = useState<UnlockType>("time");
  const [inactiveDays, setInactiveDays] = useState(0);
  const [inactiveHours, setInactiveHours] = useState(0);
  const [inactiveMinutes, setInactiveMinutes] = useState(0);
  const [voters, setVoters] = useState<string>("");

  const handleSubmit = async () => {
    if (!file || !encryptionKey) return alert("Файл і ключ обов'язкові");
    setLoading(true);
    console.log("Тип розблокування:", unlockType);
    if (unlockType === "time") {
      console.log(
        `Розблокування за часом: ${inactiveDays} днів, ${inactiveHours} годин, ${inactiveMinutes} хвилин`
      );
    } else if (unlockType === "vote") {
      console.log("Гаманці для голосування:", voters);
    }
    try {
      setTimeout(() => {
        const mockCID = "bafy...mockedcid";
        setCID(mockCID);

        const newSafe = {
          cid: mockCID,
          encryptionKey,
          unlockType,
          timestamp: Date.now(),
          fileName: file.name,
          inactiveDays,
          inactiveHours,
          inactiveMinutes,
          voters: voters.trim().split("\n"),
        };

        const existingSafes = Cookies.get("deathlocker-safes");
        const safes = existingSafes ? JSON.parse(existingSafes) : [];
        safes.push(newSafe);
        Cookies.set("deathlocker-safes", JSON.stringify(safes), { expires: 365 });

        setLoading(false);
      }, 1500);
    } catch (err) {
      alert("Помилка при завантаженні: " + (err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-blue-900 p-6">
      <div className="bg-zinc-800 text-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-zinc-700">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 rounded-full p-3 border-4 border-zinc-700">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>

        <h1 className="text-2xl font-bold text-center mt-6 mb-8 text-blue-300">Цифровий Сейф</h1>

        <label className="block text-sm text-zinc-400 mb-1">Файл для збереження</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:px-4 file:py-2 mb-4 bg-zinc-700 text-zinc-200"
        />

        <label className="block text-sm text-zinc-400 mb-1">Ключ шифрування</label>
        <div className="relative mb-4">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="password"
            placeholder="Введіть свій ключ"
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <label className="block text-sm text-zinc-400 mb-1">Тип розблокування</label>
        <select
          value={unlockType}
          onChange={(e) => setUnlockType(e.target.value as UnlockType)}
          className="w-full py-2 px-3 rounded-md bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        >
          <option value="time">За часом після неактивності</option>
          <option value="vote">За голосуванням</option>
        </select>

        {unlockType === "time" && (
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-1">Час до розблокування після неактивності:</label>
            <div className="flex space-x-2">
              <div>
                <label className="block text-xs text-zinc-500 mb-0.5">Днів</label>
                <input
                  type="number"
                  value={inactiveDays}
                  onChange={(e) => setInactiveDays(parseInt(e.target.value))}
                  className="w-16 py-2 px-3 rounded-md bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-0.5">Годин</label>
                <input
                  type="number"
                  value={inactiveHours}
                  onChange={(e) => setInactiveHours(parseInt(e.target.value))}
                  className="w-16 py-2 px-3 rounded-md bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-0.5">Хвилин</label>
                <input
                  type="number"
                  value={inactiveMinutes}
                  onChange={(e) => setInactiveMinutes(parseInt(e.target.value))}
                  className="w-16 py-2 px-3 rounded-md bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {unlockType === "vote" && (
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-1">Гаманці для голосування (кожний з нового рядка)</label>
            <textarea
              value={voters}
              onChange={(e) => setVoters(e.target.value)}
              className="w-full py-2 px-3 rounded-md bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>
        )}

        <Button onClick={handleSubmit} disabled={loading || !file || !encryptionKey} className="w-full bg-blue-600 hover:bg-blue-700">
          {loading ? "Завантаження..." : "🔐 Створити сейф"}
        </Button>

        {cid && (
          <div className="mt-6 bg-zinc-900 border border-zinc-700 p-4 rounded-lg text-sm text-blue-300">
            <p className="mb-1">✅ Сейф створено!</p>
            <p className="break-all">
              <strong>CID:</strong> {cid}
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              Не забудьте зберегти свій ключ шифрування. Без нього ви не зможете відновити доступ до даних.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}