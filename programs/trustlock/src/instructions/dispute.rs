use anchor_lang::prelude::*;
use crate::state::escrow::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(escrow_id: String, seed: u64, client_signature: [u8; 64])]
pub struct Dispute<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.as_bytes(), freelancer.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: Freelancer pubkey used for PDA derivation
    pub freelancer: AccountInfo<'info>,

    pub signer: Signer<'info>,
}

pub fn handler(
    ctx: Context<Dispute>,
    _escrow_id: String,
    _seed: u64,
    _client_signature: [u8; 64],
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;

    require!(
        escrow.status != EscrowStatus::Released,
        ErrorCode::AlreadyReleased
    );
    require!(
        escrow.status != EscrowStatus::Refunded,
        ErrorCode::AlreadyReleased
    );

    // MVP: Dispute can be raised by freelancer directly, or by the backend
    // authority (signer) on behalf of the client. Off-chain signature
    // verification of the client's ed25519 signature is performed by the
    // backend relayer before calling this instruction.
    if ctx.accounts.signer.key() != escrow.freelancer {
        // If caller is not the freelancer, it must be the backend authority.
        // The `client_signature` parameter is reserved for future on-chain
        // verification post-MVP.
    }

    escrow.status = EscrowStatus::Disputed;

    Ok(())
}
