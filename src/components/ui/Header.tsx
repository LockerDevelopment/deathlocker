import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";
import WalletConnection from "@/components/WalletConnection";

export default function Header() {
  return (
    <div className="flex items-center justify-between w-full py-4 bg-black text-gray-200">
      <div className="flex gap-4">
        <Link href="/create-safe">
          <Button className="bg-transparent hover:bg-gray-800 text-primary border border-primary hover:border-accent">
            <Lock className="mr-2 w-4 h-4" /> Створити сейф
          </Button>
        </Link>
        <Link href="/my-safes">
          <Button variant="outline" className="border-primary text-primary hover:text-accent hover:border-accent">
            <ShieldCheck className="mr-2 w-4 h-4" /> Відкрити сейф
          </Button>
        </Link>
        <Link href="/available-safes" className="flex items-center text-primary hover:text-accent">
          <ShieldCheck className="mr-2 w-4 h-4" /> Очікуванні сейф
        </Link>
      </div>
      <WalletConnection />
    </div>
  );
}