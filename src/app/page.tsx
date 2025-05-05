

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 to-blue-900 text-white px-6 py-20 flex flex-col items-center justify-center text-center space-y-10">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold leading-tight text-blue-300">
          🔐 DeathLocker — цифровий сейф для важливих даних після смерті
        </h1>

        <p className="text-lg text-zinc-400">
          Проблема: мільйони людей втрачають доступ до криптогаманців, паролів, документів після смерті власника. Важлива інформація зникає назавжди.
        </p>

        <p className="text-lg text-zinc-300">
          Рішення: DeathLocker — шифрований Web3-сейф з таймером або DAO-контролем, що дозволяє зберігати інформацію та передавати її лише після вашої смерті.
        </p>        
      </div>

      <footer className="text-xs text-zinc-500 mt-16">
        Створено на Solana + IPFS • Hackathon 2025
      </footer>
    </main>
  );
}