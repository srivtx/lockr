use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::escrow::*;
use crate::errors::ErrorCode;
use crate::USDC_DEVNET_MINT;

#[derive(Accounts)]
#[instruction(escrow_id: String, milestone_index: u8, seed: u64)]
pub struct FundEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.as_bytes(), freelancer.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: Freelancer pubkey used for PDA derivation
    pub freelancer: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = payer,
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
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<FundEscrow>,
    _escrow_id: String,
    milestone_index: u8,
    _seed: u64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;

    require!(
        escrow.status == EscrowStatus::Pending || escrow.status == EscrowStatus::Funded,
        ErrorCode::EscrowNotFunded
    );

    let milestone = escrow
        .milestones
        .get_mut(milestone_index as usize)
        .ok_or(ErrorCode::InvalidMilestoneCount)?;

    require!(
        milestone.status == MilestoneStatus::Pending,
        ErrorCode::MilestoneNotFunded
    );

    // Transfer USDC from payer to escrow
    let cpi_accounts = Transfer {
        from: ctx.accounts.payer_token_account.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, milestone.amount)?;

    milestone.status = MilestoneStatus::Funded;
    escrow.status = EscrowStatus::Funded;

    Ok(())
}
