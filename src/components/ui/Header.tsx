import Link from "next/link";
import { Button } from "@/components/ui/button"; 
import { Lock, ShieldCheck } from "lucide-react";
import WalletConnection from "@/components/WalletConnection";

export default function Header() {
  return (
    <div className="flex items-center justify-between w-full py-4">
      <div className="flex gap-4">
        <Link href="/create-safe">
          <Button className="bg-blue-600 hover:bg-blue-700 text-sm text-white">
            <Lock className="mr-2 w-4 h-4" /> Створити сейф
          </Button>
        </Link>
        <Link href="/unlock-safe">
          <Button variant="outline" className="border-zinc-700 text-white text-sm">
            <ShieldCheck className="mr-2 w-4 h-4" /> Відкрити сейф
          </Button>
        </Link>
      </div>
      <WalletConnection />
    </div>
  );
}