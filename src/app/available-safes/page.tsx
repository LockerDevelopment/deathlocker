"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { IDL } from "../../program/target/types/deathlocker";

interface Safe {
  cid: string;
  fileName: string;
  unlockType: "time" | "vote";
  createdAt: string;
  timeUnlock?: {
    days: number;
    hours: number;
    minutes: number;
  };
  voters?: string[];
  votes?: string[];
  requiredVotes?: number;
  isLocked: boolean;
}

export default function AvailableSafesPage() {
  const [safes, setSafes] = useState<Safe[]>([]);
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (!wallet.publicKey) return;
    fetchSafes();
  }, [wallet.publicKey]);

  const fetchSafes = async () => {
    if (!wallet.publicKey) return;

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = new Program(IDL, process.env.NEXT_PUBLIC_PROGRAM_ID!, provider);

     
      const vaults = await program.account.vault.all([
        {
          memcmp: {
            offset: 8 + 32 + 100 + 1 + 8 + 8 + 1, 
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      const safesData = await Promise.all(
        vaults.map(async (vault) => {
          const [vaultPda] = await web3.PublicKey.findProgramAddress(
            [Buffer.from("vault"), vault.account.owner.toBuffer()],
            program.programId
          );

          return {
            cid: vault.account.ipfsCid,
            fileName: "Encrypted File", // We don't store filename on-chain
            unlockType: vault.account.unlockType.timeBased ? "time" : "vote",
            createdAt: new Date(vault.account.createdAt.toNumber() * 1000).toISOString(),
            timeUnlock: vault.account.unlockType.timeBased
              ? {
                  days: Math.floor(vault.account.unlockDelay.toNumber() / (24 * 60 * 60)),
                  hours: Math.floor((vault.account.unlockDelay.toNumber() % (24 * 60 * 60)) / (60 * 60)),
                  minutes: Math.floor((vault.account.unlockDelay.toNumber() % (60 * 60)) / 60),
                }
              : undefined,
            voters: vault.account.voters.map((v) => v.toBase58()),
            votes: vault.account.votes.map((v) => v.toBase58()),
            requiredVotes: vault.account.requiredVotes,
            isLocked: vault.account.isLocked,
          };
        })
      );

      setSafes(safesData);
    } catch (err) {
      console.error("Error fetching safes:", err);
    }
  };

  const handleVote = async (vaultPda: web3.PublicKey) => {
    if (!wallet.publicKey) return;
    setLoading(true);

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = new Program(IDL, process.env.NEXT_PUBLIC_PROGRAM_ID!, provider);

      await program.methods
        .voteForUnlock()
        .accounts({
          vault: vaultPda,
          voter: wallet.publicKey,
        })
        .rpc();

      await fetchSafes();
    } catch (err) {
      console.error("Error voting:", err);
      alert("Error voting: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUnlock = async (vaultPda: web3.PublicKey) => {
    if (!wallet.publicKey) return;
    setLoading(true);

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = new Program(IDL, process.env.NEXT_PUBLIC_PROGRAM_ID!, provider);

      await program.methods
        .checkTimeUnlock()
        .accounts({
          vault: vaultPda,
        })
        .rpc();

      await fetchSafes();
    } catch (err) {
      console.error("Error checking time unlock:", err);
      alert("Error checking time unlock: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-gray-200 bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-primary">🔐 Доступні сейфи</h1>
      {!wallet.publicKey && (
        <p className="text-gray-400">Будь ласка, підключіть гаманець для перегляду доступних сейфів.</p>
      )}
      {wallet.publicKey && safes.length === 0 && (
        <p className="text-gray-400">Ви не маєте доступу до жодного сейфа.</p>
      )}
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
            {!safe.isLocked && (
              <Button
                onClick={() => {
                  const [vaultPda] = web3.PublicKey.findProgramAddressSync(
                    [Buffer.from("vault"), new web3.PublicKey(safe.voters![0]).toBuffer()],
                    new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)
                  );
                  if (safe.unlockType === "vote") {
                    handleVote(vaultPda);
                  } else {
                    handleTimeUnlock(vaultPda);
                  }
                }}
                disabled={loading}
                className="mt-2 bg-transparent hover:bg-gray-800 text-accent border border-accent hover:border-secondary"
              >
                {loading ? "Завантаження..." : "Розблокувати"}
              </Button>
            )}
            {safe.isLocked && (
              <p className="text-green-500 mt-2">Сейф розблоковано.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
