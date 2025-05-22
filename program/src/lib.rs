use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod deathlocker {
    use super::*;

    pub fn create_vault(
        ctx: Context<CreateVault>,
        ipfs_cid: String,
        unlock_type: UnlockType,
        voters: Vec<Pubkey>,
        required_votes: u8,
        unlock_delay: i64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;

        vault.owner = ctx.accounts.owner.key();
        vault.ipfs_cid = ipfs_cid;
        vault.unlock_type = unlock_type;
        vault.created_at = clock.unix_timestamp;
        vault.last_activity = clock.unix_timestamp;
        vault.is_locked = false;
        vault.voters = voters;
        vault.votes = Vec::new();
        vault.required_votes = required_votes;
        vault.unlock_delay = unlock_delay;

        Ok(())
    }

    pub fn vote_for_unlock(ctx: Context<VoteForUnlock>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let voter = ctx.accounts.voter.key();

        require!(!vault.is_locked, VaultError::VaultAlreadyUnlocked);
        require!(vault.voters.contains(&voter), VaultError::NotAuthorizedVoter);
        require!(!vault.votes.contains(&voter), VaultError::AlreadyVoted);

        vault.votes.push(voter);

        if vault.votes.len() >= vault.required_votes as usize {
            vault.is_locked = true;
        }

        Ok(())
    }

    pub fn check_time_unlock(ctx: Context<CheckTimeUnlock>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;

        require!(!vault.is_locked, VaultError::VaultAlreadyUnlocked);
        require!(
            vault.unlock_type == UnlockType::TimeBased,
            VaultError::InvalidUnlockType
        );

        let time_since_last_activity = clock.unix_timestamp - vault.last_activity;
        require!(
            time_since_last_activity >= vault.unlock_delay,
            VaultError::UnlockDelayNotMet
        );

        vault.is_locked = true;
        Ok(())
    }

    pub fn update_last_activity(ctx: Context<UpdateLastActivity>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;

        require!(vault.owner == ctx.accounts.owner.key(), VaultError::NotOwner);
        vault.last_activity = clock.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(
        init,
        payer = owner,
        space = Vault::LEN,
        seeds = [b"vault", owner.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteForUnlock<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub voter: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckTimeUnlock<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
}

#[derive(Accounts)]
pub struct UpdateLastActivity<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub owner: Signer<'info>,
}

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub ipfs_cid: String,
    pub unlock_type: UnlockType,
    pub created_at: i64,
    pub last_activity: i64,
    pub is_locked: bool,
    pub voters: Vec<Pubkey>,
    pub votes: Vec<Pubkey>,
    pub required_votes: u8,
    pub unlock_delay: i64,
}

impl Vault {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        100 + // ipfs_cid (max length)
        1 + // unlock_type
        8 + // created_at
        8 + // last_activity
        1 + // is_locked
        4 + // voters vec length
        (32 * 10) + // voters (max 10 voters)
        4 + // votes vec length
        (32 * 10) + // votes (max 10 votes)
        1 + // required_votes
        8; // unlock_delay
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum UnlockType {
    TimeBased,
    VoteBased,
}

#[error_code]
pub enum VaultError {
    #[msg("Vault is already unlocked")]
    VaultAlreadyUnlocked,
    #[msg("Not an authorized voter")]
    NotAuthorizedVoter,
    #[msg("Already voted")]
    AlreadyVoted,
    #[msg("Invalid unlock type")]
    InvalidUnlockType,
    #[msg("Unlock delay not met")]
    UnlockDelayNotMet,
    #[msg("Not the vault owner")]
    NotOwner,
} 