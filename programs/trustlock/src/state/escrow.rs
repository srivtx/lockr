use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    pub freelancer: Pubkey,
    pub client_email_hash: [u8; 32],
    pub total_amount: u64,
    pub status: EscrowStatus,
    pub deadline: i64,
    pub milestones: Vec<Milestone>,
    pub bump: u8,
    pub escrow_id: String,
    pub seed: u64,
}

impl Escrow {
    pub const MAX_MILESTONES: usize = 5;
    pub const MAX_ESCROW_ID_LEN: usize = 36; // UUID length
    pub const MAX_DESCRIPTION_LEN: usize = 100;

    pub const SPACE: usize =
        8 +                              // discriminator
        32 +                             // freelancer: Pubkey
        32 +                             // client_email_hash: [u8; 32]
        8 +                              // total_amount: u64
        1 +                              // status: EscrowStatus
        8 +                              // deadline: i64
        4 + Self::MAX_MILESTONES * Milestone::SPACE + // milestones: Vec<Milestone>
        1 +                              // bump: u8
        4 + Self::MAX_ESCROW_ID_LEN +    // escrow_id: String
        8;                               // seed: u64
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Pending,
    Funded,
    Delivered,
    Released,
    Disputed,
    Refunded,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Milestone {
    pub description: String, // max 100 chars
    pub amount: u64,
    pub status: MilestoneStatus,
}

impl Milestone {
    pub const SPACE: usize =
        4 + Escrow::MAX_DESCRIPTION_LEN + // description: String
        8 +                               // amount: u64
        1;                                // status: MilestoneStatus
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MilestoneStatus {
    Pending,
    Funded,
    Complete,
    Released,
}
