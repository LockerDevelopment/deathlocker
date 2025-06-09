"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Key, Users, Clock } from "lucide-react";
import Cookies from "js-cookie";
import { encryptFile } from "@/lib/utils";

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

    try {
      const encryptedBlob = await encryptFile(file, encryptionKey);

      const formData = new FormData();
      formData.append("file", encryptedBlob, file.name);
      formData.append("filename", file.name);
      formData.append("fileType", file.type);

     
      const cid = "asd7aaea6r98asf";

      const safe = {
        cid: cid,
        unlockType,
        encryptionKey, 
        fileName: file.name,
        createdAt: new Date().toISOString(),
        timeUnlock:
          unlockType === "time"
            ? { days: inactiveDays, hours: inactiveHours, minutes: inactiveMinutes }
            : null,
        voters: unlockType === "vote"
          ? voters.split("\n").map(v => v.trim()).filter(Boolean)
          : null,
        heirs: [] 
      };

      
      const existingSafes = Cookies.get("deathlocker-safes");
      const safes = existingSafes ? JSON.parse(existingSafes) : [];
      safes.push(safe);
      Cookies.set("deathlocker-safes", JSON.stringify(safes), { expires: 365 });

      setCID(cid);
    } catch (err) {
      alert("Помилка при завантаженні: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 text-gray-200">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-primary">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black rounded-full p-3 border-4 border-primary">
          <Lock className="w-8 h-8 text-accent" />
        </div>

        <h1 className="text-2xl font-bold text-center mt-6 mb-8 text-primary">Цифровий Сейф</h1>

        <label className="block text-sm text-gray-400 mb-1">Файл для збереження</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm file:rounded-md file:border-0 file:bg-primary file:text-white file:px-4 file:py-2 mb-4 bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <label className="block text-sm text-gray-400 mb-1">Ключ шифрування</label>
        <div className="relative mb-4">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="password"
            placeholder="Введіть свій ключ"
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <label className="block text-sm text-gray-400 mb-1">Тип розблокування</label>
        <select
          value={unlockType}
          onChange={(e) => setUnlockType(e.target.value as UnlockType)}
          className="w-full py-2 px-3 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent mb-4"
        >
          <option value="time">За часом після неактивності</option>
          <option value="vote">За голосуванням</option>
        </select>

        {unlockType === "time" && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Час до розблокування після неактивності:</label>
            <div className="flex space-x-2">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Днів</label>
                <input
                  type="number"
                  value={inactiveDays}
                  onChange={(e) => setInactiveDays(parseInt(e.target.value))}
                  className="w-16 py-2 px-3 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Годин</label>
                <input
                  type="number"
                  value={inactiveHours}
                  onChange={(e) => setInactiveHours(parseInt(e.target.value))}
                  className="w-16 py-2 px-3 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Хвилин</label>
                <input
                  type="number"
                  value={inactiveMinutes}
                  onChange={(e) => setInactiveMinutes(parseInt(e.target.value))}
                  className="w-16 py-2 px-3 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {unlockType === "vote" && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Гаманці для голосування (кожний з нового рядка)</label>
            <textarea
              value={voters}
              onChange={(e) => setVoters(e.target.value)}
              className="w-full py-2 px-3 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              rows={3}
            />
          </div>
        )}

        <Button onClick={handleSubmit} disabled={loading || !file || !encryptionKey} className="w-full bg-transparent hover:bg-gray-800 text-primary border border-primary hover:border-accent">
          {loading ? "Завантаження..." : "🔐 Створити сейф"}
        </Button>

        {cid && (
          <div className="mt-6 bg-gray-900 border border-primary p-4 rounded-lg text-sm text-accent">
            <p className="mb-1">✅ Сейф створено!</p>
            <p className="break-all">
              <strong>CID:</strong> {cid}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Не забудьте зберегти свій ключ шифрування. Без нього ви не зможете відновити доступ до даних.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}