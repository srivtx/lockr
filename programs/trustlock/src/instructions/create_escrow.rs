use anchor_lang::prelude::*;
use sha3::{Digest, Keccak256};
use crate::state::escrow::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(escrow_id: String, client_email: String, total_amount: u64, deadline: i64, milestones: Vec<Milestone>, seed: u64)]
pub struct CreateEscrow<'info> {
    #[account(
        init,
        payer = freelancer,
        space = Escrow::SPACE,
        seeds = [b"escrow", escrow_id.as_bytes(), freelancer.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub freelancer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateEscrow>,
    escrow_id: String,
    client_email: String,
    total_amount: u64,
    deadline: i64,
    milestones: Vec<Milestone>,
    seed: u64,
) -> Result<()> {
    require!(
        milestones.len() <= Escrow::MAX_MILESTONES,
        ErrorCode::InvalidMilestoneCount
    );

    let mut sum: u64 = 0;
    for m in &milestones {
        require!(
            m.description.len() <= Escrow::MAX_DESCRIPTION_LEN,
            ErrorCode::InvalidMilestoneCount
        );
        sum = sum
            .checked_add(m.amount)
            .ok_or(ErrorCode::InvalidMilestoneAmount)?;
    }
    require_eq!(sum, total_amount, ErrorCode::InvalidMilestoneAmount);

    let client_email_hash = Keccak256::digest(client_email.as_bytes());
    let mut hash_bytes = [0u8; 32];
    hash_bytes.copy_from_slice(&client_email_hash);

    let escrow = &mut ctx.accounts.escrow;
    escrow.freelancer = ctx.accounts.freelancer.key();
    escrow.client_email_hash = hash_bytes;
    escrow.total_amount = total_amount;
    escrow.status = EscrowStatus::Pending;
    escrow.deadline = deadline;
    escrow.milestones = milestones;
    escrow.bump = ctx.bumps.escrow;
    escrow.escrow_id = escrow_id;
    escrow.seed = seed;

    Ok(())
}
