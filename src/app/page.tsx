import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, UserPlus } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 flex flex-col items-center justify-center text-center space-y-10">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold leading-tight">
          🔐 DeathLocker — цифровий сейф для важливих даних після смерті
        </h1>

        <p className="text-lg text-zinc-400">
          Проблема: мільйони людей втрачають доступ до криптогаманців, паролів, документів після смерті власника. Важлива інформація зникає назавжди.
        </p>

        <p className="text-lg text-zinc-300">
          Рішення: DeathLocker — шифрований Web3-сейф з таймером або DAO-контролем, що дозволяє зберігати інформацію та передавати її лише після вашої смерті.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/create-safe">
            <Button className="bg-green-600 hover:bg-green-500">
              <Lock className="mr-2 w-5 h-5" /> Створити сейф
            </Button>
          </Link>

          <Link href="/unlock-safe">
            <Button variant="outline" className="border-zinc-700 text-white">
              <ShieldCheck className="mr-2 w-5 h-5" /> Відкрити сейф
            </Button>
          </Link>
        </div>
      </div>

      <footer className="text-xs text-zinc-500 mt-16">
        Створено на Solana + IPFS • Hackathon 2025
      </footer>
    </main>
  );
}
