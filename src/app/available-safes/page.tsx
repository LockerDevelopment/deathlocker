"use client";

import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";

export default function AvailableSafesPage() {
  const [safes, setSafes] = useState<any[]>([]);
  const wallet = useWallet()

  useEffect(() => {
    const existing = Cookies.get("deathlocker-safes");
   
    if (existing) {
      const allSafes = JSON.parse(existing);  
       
      const filteredSafes = allSafes.filter(
        (safe: any) =>
          (safe.voters && safe.voters.includes(wallet.publicKey)) ||
          (safe.heirs && safe.heirs.includes(wallet.publicKey))
      );
      console.log(filteredSafes) 
      setSafes(filteredSafes);
    }
  }, [wallet.publicKey]);

  const unlockSafe = (cid: string) => {
    
    console.log("Розблокувати сейф з CID:", cid);
  };

  return (
    <div className="p-6 text-gray-200 bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-primary">🔐 Доступні сейфи</h1>
      {safes.length === 0 && <p className="text-gray-400">Ви не маєте доступу до жодного сейфа.</p>}
      <ul className="space-y-4">
        {safes.map((safe) => (
          <li key={safe.cid} className="bg-gray-900 p-4 rounded-lg border border-primary text-gray-300">
            <p><strong>📁 Файл:</strong> {safe.fileName}</p>
            <p><strong>🔓 Тип:</strong> {safe.unlockType}</p>
            <p><strong>CID:</strong> {safe.cid}</p>
            <p><strong>🕒 Дата створення:</strong> {new Date(safe.createdAt).toLocaleString()}</p>
            {safe.timeUnlock && (
              <p>
                ⏱ Час до розблокування: {safe.timeUnlock.days}д {safe.timeUnlock.hours}г {safe.timeUnlock.minutes}хв
              </p>
            )}
            {safe.voters && (
              <p>👥 Голосуючі: {safe.voters.join(", ")}</p>
            )}
            {safe.unlockType === "vote" && safe.votes && (
              <p>🗳 Голосів: {safe.votes.length}/{safe.requiredVotes}</p>
            )}
            {safe.isLocked ? (
              <Button onClick={() => unlockSafe(safe.cid)} className="mt-2 bg-transparent hover:bg-gray-800 text-accent border border-accent hover:border-secondary">
                Розблокувати
              </Button>
            ) : (
              <p className="text-green-500 mt-2">Сейф розблоковано.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
