use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;

use state::escrow::*;
use instructions::*;

// Placeholder program ID — replace with deployed address
// This is a valid 32-byte base58 pubkey starting with "TrustLock"
declare_id!("TrustLock1111111111111111111111111111111111");

pub const USDC_DEVNET_MINT: Pubkey = Pubkey::new_from_array([
    0x3b, 0x44, 0x2c, 0xb3, 0x91, 0x21, 0x57, 0xf1,
    0x3a, 0x93, 0x3d, 0x01, 0x34, 0x28, 0x2d, 0x03,
    0x2b, 0x5f, 0xfe, 0xcd, 0x01, 0xa2, 0xdb, 0xf1,
    0xb7, 0x79, 0x06, 0x08, 0xdf, 0x00, 0x2e, 0xa7,
]);

#[program]
pub mod trustlock {
    use super::*;

    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        escrow_id: String,
        client_email: String,
        total_amount: u64,
        deadline: i64,
        milestones: Vec<Milestone>,
        seed: u64,
    ) -> Result<()> {
        instructions::create_escrow::handler(ctx, escrow_id, client_email, total_amount, deadline, milestones, seed)
    }

    pub fn fund_escrow(
        ctx: Context<FundEscrow>,
        escrow_id: String,
        milestone_index: u8,
        seed: u64,
    ) -> Result<()> {
        instructions::fund_escrow::handler(ctx, escrow_id, milestone_index, seed)
    }

    pub fn release_milestone(
        ctx: Context<ReleaseMilestone>,
        escrow_id: String,
        milestone_index: u8,
        seed: u64,
        client_signature: [u8; 64],
    ) -> Result<()> {
        instructions::release_milestone::handler(ctx, escrow_id, milestone_index, seed, client_signature)
    }

    pub fn refund(
        ctx: Context<Refund>,
        escrow_id: String,
        seed: u64,
    ) -> Result<()> {
        instructions::refund::handler(ctx, escrow_id, seed)
    }

    pub fn dispute(
        ctx: Context<Dispute>,
        escrow_id: String,
        seed: u64,
        client_signature: [u8; 64],
    ) -> Result<()> {
        instructions::dispute::handler(ctx, escrow_id, seed, client_signature)
    }
}
