# DeathLocker

**DeathLocker** is a decentralized, encrypted data vault designed to securely store and transfer sensitive information after a user's inactivity or death. It solves the problem of digital legacy management in the Web3 era by combining time-based unlocking, cryptographic encryption, and decentralized file storage.

---

##  Problem

In the Web2 and Web3 ecosystems alike, there is no reliable, trustless mechanism to pass encrypted personal data, private keys, or important files to trusted individuals after one's death or prolonged inactivity. Current solutions rely on centralized services, custodians, or legal intermediaries.

---

##  Solution

**DeathLocker** provides a decentralized alternative — a secure, on-chain reference to an encrypted file stored on IPFS, which can be unlocked either:

- After a specified period of user inactivity (time-lock).
- Through a decentralized voting mechanism by pre-approved guardians (social recovery).

Each "locker" is created with encryption, a chosen unlock method, and metadata stored securely in cookies (for demo), with planned full on-chain metadata and access rights.

---

##  Key Features

- **Encryption**: Files are encrypted client-side with a user-provided passphrase. Only those with the key can decrypt.
- **Decentralized Storage**: Files are stored via Web3.Storage on IPFS, ensuring censorship resistance and availability.
- **Unlocking Mechanisms**:
  - **Time-Based Unlock**: Automatically becomes accessible after user inactivity.
  - **Voting-Based Unlock**: Requires votes from trusted wallet addresses to unlock.
- **Inheritance Model**: Users can define heirs or voters to manage their digital legacy.
- **Non-custodial**: The platform does not hold any keys, data, or user control. Only users or their designated guardians can access vaults.

---

## ⚙ Tech Stack

- **Frontend**: Next.js + TypeScript
- **Web3**: Solana Wallet Adapter
- **Storage**: IPFS 
- **State Management**: on-chain metadata
- **UI/UX**: Tailwind CSS + shadcn/ui components

---

##  Demo Flow

1. **Create Vault**:
   - Upload a file.
   - Provide an encryption passphrase.
   - Choose unlock method: time-based or vote-based.
   - Define unlock delay or voter wallet addresses.

2. **Store Metadata**:
   - File is encrypted in-browser.
   - CID from IPFS is stored along with metadata (locally in this prototype).

3. **Access Vaults**:
   - If the connected wallet matches any designated voter/heir, vaults become visible.
   - Decryption is possible only with the original passphrase.

---

##  Use Cases

- Inheritance of seed phrases, private keys, passwords.
- Secure transmission of medical or legal documents.
- Decentralized "last will" execution without intermediaries.
- Social recovery of digital assets.



---

##  Future Vision

DeathLocker aims to become a trustless, secure, and decentralized platform for digital legacy management — bringing privacy, permanence, and peace of mind to the age of Web3.



