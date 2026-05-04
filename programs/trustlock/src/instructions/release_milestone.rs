use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use crate::state::escrow::*;
use crate::errors::ErrorCode;
use crate::USDC_DEVNET_MINT;

#[derive(Accounts)]
#[instruction(escrow_id: String, milestone_index: u8, seed: u64, client_signature: [u8; 64])]
pub struct ReleaseMilestone<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.as_bytes(), freelancer.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
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
        associated_token::authority = freelancer,
    )]
    pub freelancer_token_account: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,

    #[account(address = USDC_DEVNET_MINT)]
    pub usdc_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<ReleaseMilestone>,
    _escrow_id: String,
    milestone_index: u8,
    _seed: u64,
    _client_signature: [u8; 64],
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;

    require!(
        escrow.status == EscrowStatus::Funded || escrow.status == EscrowStatus::Delivered,
        ErrorCode::EscrowNotFunded
    );

    let milestone = escrow
        .milestones
        .get_mut(milestone_index as usize)
        .ok_or(ErrorCode::InvalidMilestoneCount)?;

    require!(
        milestone.status == MilestoneStatus::Funded,
        ErrorCode::MilestoneNotFunded
    );

    let amount = milestone.amount;
    milestone.status = MilestoneStatus::Released;

    // Drop the mutable borrow on the milestone so we can borrow escrow fields
    drop(milestone);

    // Transfer USDC from escrow to freelancer using PDA signer
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
        to: ctx.accounts.freelancer_token_account.to_account_info(),
        authority: escrow.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

    token::transfer(cpi_ctx, amount)?;

    // If all milestones released, mark escrow as Released
    let all_released = escrow
        .milestones
        .iter()
        .all(|m| m.status == MilestoneStatus::Released);

    if all_released {
        escrow.status = EscrowStatus::Released;
    } else {
        escrow.status = EscrowStatus::Delivered;
    }

    Ok(())
}
