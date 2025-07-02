import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Deathlocker } from "../target/types/deathlocker";
import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";

describe("deathlocker", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Deathlocker as Program<Deathlocker>;
  const owner = anchor.web3.Keypair.generate();
  const voter = anchor.web3.Keypair.generate();

  const ipfsCid = "QmTest123";
  const voters = [voter.publicKey];
  const requiredVotes = 1;
  const unlockDelay = 60 * 60 * 24; 

  let vaultPda: PublicKey;
  let vaultBump: number;

  before(async () => {
    [vaultPda, vaultBump] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), owner.publicKey.toBuffer()],
      program.programId
    );

    // Airdrop SOL to owner and voter
    await provider.connection.requestAirdrop(owner.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(voter.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  });

  it("Creates a vault", async () => {
    await program.methods
      .createVault(
        ipfsCid,
        { timeBased: {} },
        voters,
        requiredVotes,
        new anchor.BN(unlockDelay)
      )
      .accounts({
        vault: vaultPda,
        owner: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    expect(vault.owner.toString()).to.equal(owner.publicKey.toString());
    expect(vault.ipfsCid).to.equal(ipfsCid);
    expect(vault.unlockType).to.deep.equal({ timeBased: {} });
    expect(vault.isLocked).to.be.false;
    expect(vault.voters[0].toString()).to.equal(voter.publicKey.toString());
    expect(vault.requiredVotes).to.equal(requiredVotes);
    expect(vault.unlockDelay.toNumber()).to.equal(unlockDelay);
  });

  it("Updates last activity", async () => {
    await program.methods
      .updateLastActivity()
      .accounts({
        vault: vaultPda,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    expect(vault.lastActivity.toNumber()).to.be.greaterThan(0);
  });

  it("Votes for unlock", async () => {
    await program.methods
      .voteForUnlock()
      .accounts({
        vault: vaultPda,
        voter: voter.publicKey,
      })
      .signers([voter])
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    expect(vault.votes[0].toString()).to.equal(voter.publicKey.toString());
    expect(vault.isLocked).to.be.true;
  });
}); 