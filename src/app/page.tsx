export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-gray-200 px-6 py-20 flex flex-col items-center justify-center text-center space-y-10">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold leading-tight text-primary">
          🔐 DeathLocker — цифровий сейф для важливих даних після смерті
        </h1>

        <p className="text-lg text-gray-400">
          Проблема: мільйони людей втрачають доступ до криптогаманців, паролів, документів після смерті власника. Важлива інформація зникає назавжди.
        </p>

        <p className="text-lg text-gray-300">
          Рішення: DeathLocker — шифрований Web3-сейф з таймером або DAO-контролем, що дозволяє зберігати інформацію та передавати її лише після вашої смерті.
        </p>        
      </div>

      <footer className="text-xs text-gray-500 mt-16">
        Створено на Solana + IPFS • Hackathon 2025
      </footer>
    </main>
  );
}