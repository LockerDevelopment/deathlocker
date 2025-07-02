use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod deathlocker {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.owner = ctx.accounts.owner.key();
        state.bump = *ctx.bumps.get("state").unwrap();
        Ok(())
    }

    pub fn create_vault(
        ctx: Context<CreateVault>,
        ipfs_cid: String,
        inactivity_threshold: i64,
        beneficiaries: Vec<Pubkey>,
        beneficiary_shares: Vec<u64>,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;

        // Validate inputs
        require!(!ipfs_cid.is_empty(), VaultError::InvalidIpfsCid);
        require!(inactivity_threshold > 0, VaultError::InvalidThreshold);
        require!(
            beneficiaries.len() == beneficiary_shares.len(),
            VaultError::InvalidBeneficiaryConfig
        );
        require!(!beneficiaries.is_empty(), VaultError::NoBeneficiaries);
        require!(
            beneficiaries.len() <= MAX_BENEFICIARIES,
            VaultError::TooManyBeneficiaries
        );

        // Initialize vault
        vault.owner = ctx.accounts.owner.key();
        vault.ipfs_cid = ipfs_cid;
        vault.created_at = clock.unix_timestamp;
        vault.last_activity = clock.unix_timestamp;
        vault.inactivity_threshold = inactivity_threshold;
        vault.beneficiaries = beneficiaries;
        vault.beneficiary_shares = beneficiary_shares;
        vault.is_active = true;
        vault.token_mint = ctx.accounts.token_mint.key();
        vault.bump = *ctx.bumps.get("vault").unwrap();

        Ok(())
    }

    pub fn deposit_tokens(ctx: Context<DepositTokens>, amount: u64) -> Result<()> {
        // Transfer tokens to vault
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );

        token::transfer(cpi_ctx, amount)?;

        // Update last activity
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;
        vault.last_activity = clock.unix_timestamp;

        emit!(TokensDeposited {
            vault: ctx.accounts.vault.key(),
            amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn check_inactivity(ctx: Context<CheckInactivity>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;

        require!(vault.is_active, VaultError::VaultAlreadyDistributed);

        let time_since_last_activity = clock.unix_timestamp - vault.last_activity;
        if time_since_last_activity >= vault.inactivity_threshold {
            // Distribute tokens to beneficiaries
            distribute_tokens(
                vault,
                &ctx.accounts.vault_token_account,
                &ctx.accounts.token_program,
                &ctx.accounts.state.to_account_info(),
            )?;

            vault.is_active = false;

            emit!(InactivityTriggered {
                vault: ctx.accounts.vault.key(),
                timestamp: clock.unix_timestamp,
            });
        }

        Ok(())
    }

    pub fn update_activity(ctx: Context<UpdateActivity>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;

        require!(vault.owner == ctx.accounts.owner.key(), VaultError::NotOwner);
        require!(vault.is_active, VaultError::VaultAlreadyDistributed);
        
        vault.last_activity = clock.unix_timestamp;
        
        emit!(ActivityUpdated {
            vault: ctx.accounts.vault.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

// Helper function to distribute tokens
fn distribute_tokens(
    vault: &mut Account<Vault>,
    vault_token_account: &Account<TokenAccount>,
    token_program: &Program<Token>,
    state: &AccountInfo,
) -> Result<()> {
    let total_amount = vault_token_account.amount;
    let total_shares: u64 = vault.beneficiary_shares.iter().sum();
    require!(total_shares > 0, VaultError::InvalidBeneficiaryConfig);

    // Calculate and transfer shares to each beneficiary
    for (i, beneficiary) in vault.beneficiaries.iter().enumerate() {
        let share = vault.beneficiary_shares[i];
        let amount = total_amount
            .checked_mul(share)
            .unwrap()
            .checked_div(total_shares)
            .unwrap();

        if amount > 0 {
            let seeds = &[
                b"vault",
                vault.owner.as_ref(),
                &[vault.bump],
            ];
            let signer = &[&seeds[..]];

            let cpi_ctx = CpiContext::new_with_signer(
                token_program.to_account_info(),
                Transfer {
                    from: vault_token_account.to_account_info(),
                    to: TokenAccount::create_with_seed(
                        &state.to_account_info(),
                        beneficiary,
                        &vault.token_mint.to_account_info(),
                        &vault_token_account.to_account_info(),
                        &token_program.to_account_info(),
                        &[],
                    )?,
                    authority: state.to_account_info(),
                },
                signer,
            );

            token::transfer(cpi_ctx, amount)?;
        }
    }

    Ok(())
}

// Constants
const MAX_BENEFICIARIES: usize = 10;
const MAX_IPFS_CID_LENGTH: usize = 100;

// Accounts
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + State::LEN,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + Vault::LEN,
        seeds = [b"vault", owner.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositTokens<'info> {
    #[account(mut, has_one = owner, has_one = token_mint)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CheckInactivity<'info> {
    #[account(mut, has_one = token_mint)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(
        seeds = [b"state"],
        bump = state.bump,
    )]
    pub state: Account<'info, State>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateActivity<'info> {
    #[account(mut, has_one = owner)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

// State
#[account]
pub struct State {
    pub owner: Pubkey,
    pub bump: u8,
}

impl State {
    pub const LEN: usize = 32 + 1;
}

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub ipfs_cid: String,
    pub token_mint: Pubkey,
    pub created_at: i64,
    pub last_activity: i64,
    pub inactivity_threshold: i64,
    pub beneficiaries: Vec<Pubkey>,
    pub beneficiary_shares: Vec<u64>,
    pub is_active: bool,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        MAX_IPFS_CID_LENGTH + // ipfs_cid
        32 + // token_mint
        8 + // created_at
        8 + // last_activity
        8 + // inactivity_threshold
        4 + // beneficiaries vec length
        (32 * MAX_BENEFICIARIES) + // beneficiaries
        4 + // beneficiary_shares vec length
        (8 * MAX_BENEFICIARIES) + // shares
        1 + // is_active
        1; // bump
}

// Events
#[event]
pub struct TokensDeposited {
    pub vault: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct InactivityTriggered {
    pub vault: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ActivityUpdated {
    pub vault: Pubkey,
    pub timestamp: i64,
}

// Errors
#[error_code]
pub enum VaultError {
    #[msg("Not the vault owner")]
    NotOwner,
    #[msg("Vault has already been distributed")]
    VaultAlreadyDistributed,
    #[msg("Invalid beneficiary configuration")]
    InvalidBeneficiaryConfig,
    #[msg("No beneficiaries specified")]
    NoBeneficiaries,
    #[msg("Too many beneficiaries")]
    TooManyBeneficiaries,
    #[msg("Invalid IPFS CID")]
    InvalidIpfsCid,
    #[msg("Invalid inactivity threshold")]
    InvalidThreshold,
}