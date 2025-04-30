"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Key } from "lucide-react";

export default function CreateSafePage() {
  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [cid, setCID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file || !encryptionKey) return alert("Файл і ключ обов'язкові");
    setLoading(true);
    try {      
      setTimeout(() => {
        setCID("bafy...mockedcid");
        setLoading(false);
      }, 1500);
    } catch (err) {
      alert("Помилка при завантаженні: " + (err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black p-6">
      <div className="bg-zinc-800 text-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-zinc-700">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 rounded-full p-3 border-4 border-zinc-700">
          <Lock className="w-8 h-8 text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-center mt-6 mb-8">Цифровий Сейф</h1>

        <label className="block text-sm text-zinc-400 mb-1">Файл для збереження</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm file:rounded-md file:border-0 file:bg-green-600 file:text-white file:px-4 file:py-2 mb-4 bg-zinc-700 text-zinc-200"
        />

        <label className="block text-sm text-zinc-400 mb-1">Ключ шифрування</label>
        <div className="relative mb-6">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="password"
            placeholder="Введіть свій ключ"
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading || !file || !encryptionKey} className="w-full">
          {loading ? "Завантаження..." : "🔐 Створити сейф"}
        </Button>

        {cid && (
          <div className="mt-6 bg-zinc-900 border border-zinc-700 p-4 rounded-lg text-sm text-green-300">
            <p className="mb-1">✅ Сейф створено!</p>
            <p className="break-all"><strong>CID:</strong> {cid}</p>
            <p className="text-xs text-zinc-500 mt-2">Не забудьте зберегти свій ключ шифрування. Без нього ви не зможете відновити доступ до даних.</p>
          </div>
        )}
      </div>
    </div>
  );
}