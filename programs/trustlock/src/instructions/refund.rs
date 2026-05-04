use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use crate::state::escrow::*;
use crate::errors::ErrorCode;
use crate::USDC_DEVNET_MINT;

#[derive(Accounts)]
#[instruction(escrow_id: String, seed: u64)]
pub struct Refund<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.as_bytes(), freelancer.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
        constraint = escrow.status != EscrowStatus::Released @ ErrorCode::AlreadyReleased,
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: Freelancer pubkey used for PDA derivation
    pub freelancer: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = payer,
    )]
    pub payer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(address = USDC_DEVNET_MINT)]
    pub usdc_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<Refund>,
    _escrow_id: String,
    _seed: u64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let clock = Clock::get()?;

    require!(
        clock.unix_timestamp > escrow.deadline,
        ErrorCode::DeadlineNotPassed
    );
    require!(
        escrow.status != EscrowStatus::Released,
        ErrorCode::AlreadyReleased
    );

    let escrow_balance = ctx.accounts.escrow_token_account.amount;

    if escrow_balance > 0 {
        let seed_bytes = escrow.seed.to_le_bytes();
        let seeds = &[
            b"escrow",
            escrow.escrow_id.as_bytes(),
            escrow.freelancer.as_ref(),
            seed_bytes.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.payer_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::transfer(cpi_ctx, escrow_balance)?;
    }

    escrow.status = EscrowStatus::Refunded;

    Ok(())
}
