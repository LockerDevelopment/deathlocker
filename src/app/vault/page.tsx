"use client"
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { uploadToIPFS } from "@/lib/ipfs"; 
import { Button } from "@/components/ui/button";

export default function VaultPage() {
  const { publicKey } = useWallet();

  const [vaultName, setVaultName] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [trustedContacts, setTrustedContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState("");
  const [inactiveDays, setInactiveDays] = useState(30); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleAddContact = () => {
    if (newContact && !trustedContacts.includes(newContact)) {
      setTrustedContacts([...trustedContacts, newContact]);
      setNewContact("");
    }
  };

  const handleCreateVault = async () => {
    if (!publicKey) {
      alert("Підключіть гаманець!");
      return;
    }

    try {
      
      const uploadedDocs = await Promise.all(documents.map(uploadToIPFS));

      
      const vaultData = {
        owner: publicKey.toBase58(),
        vaultName,
        documents: uploadedDocs, 
        trustedContacts,
        inactiveDays,
        createdAt: new Date().toISOString(),
      };

      console.log("Vault Data:", vaultData);

      
      alert("Сейф успішно створено! (Мок)");

    } catch (error) {
      console.error("Помилка створення сейфу:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Створення нового сейфу 🛡️</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Назва сейфу</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={vaultName}
          onChange={(e) => setVaultName(e.target.value)}
          placeholder="Наприклад: Мій криптосейф"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Документи / Файли</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Довірені особи (публічні адреси)</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 border rounded p-2"
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            placeholder="Введіть адресу гаманця..."
          />
          <Button onClick={handleAddContact}>Додати</Button>
        </div>
        <ul className="list-disc pl-5">
          {trustedContacts.map((contact, index) => (
            <li key={index} className="text-sm">{contact}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Таймер неактивності (днів)</label>
        <input
          type="number"
          min={1}
          className="w-full border rounded p-2"
          value={inactiveDays}
          onChange={(e) => setInactiveDays(Number(e.target.value))}
        />
      </div>

      <Button onClick={handleCreateVault} className="w-full p-3 text-lg font-bold">
        Створити сейф
      </Button>
    </div>
  );
}
