"use client";

import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function MySafesPage() {
  const [safes, setSafes] = useState<any[]>([]);

  useEffect(() => {
    const existing = Cookies.get("deathlocker-safes");
    if (existing) {
      setSafes(JSON.parse(existing));
    }
  }, []);

  const deleteSafe = (cid: string) => {
    const updated = safes.filter((s) => s.cid !== cid);
    setSafes(updated);
    Cookies.set("deathlocker-safes", JSON.stringify(updated), { expires: 365 });
  };

  return (
    <div className="p-6 text-white bg-zinc-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-300">🔐 Мої сейфи</h1>
      {safes.length === 0 && <p>У вас немає збережених сейфів.</p>}
      <ul className="space-y-4">
        {safes.map((safe) => (
          <li key={safe.cid} className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
            <p><strong>📁 Файл:</strong> {safe.fileName}</p>
            <p><strong>🔓 Тип:</strong> {safe.unlockType}</p>
            <p><strong>CID:</strong> {safe.cid}</p>
            <p><strong>🕒 Дата:</strong> {new Date(safe.createdAt).toLocaleString()}</p>
            {safe.timeUnlock && (
              <p>
                ⏱ Час: {safe.timeUnlock.days}д {safe.timeUnlock.hours}г {safe.timeUnlock.minutes}хв
              </p>
            )}
            {safe.voters && (
              <p>👥 Голосуючі: {safe.voters.join(", ")}</p>
            )}
            <Button onClick={() => deleteSafe(safe.cid)} className="mt-2 bg-red-600 hover:bg-red-700">Видалити</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
