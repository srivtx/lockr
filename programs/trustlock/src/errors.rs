use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Milestone amounts do not sum to total amount")]
    InvalidMilestoneAmount,
    #[msg("Milestone is not funded")]
    MilestoneNotFunded,
    #[msg("Deadline has not passed yet")]
    DeadlineNotPassed,
    #[msg("Invalid signature provided")]
    InvalidSignature,
    #[msg("Escrow has already been released")]
    AlreadyReleased,
    #[msg("Escrow is not funded")]
    EscrowNotFunded,
    #[msg("Invalid milestone count or description length")]
    InvalidMilestoneCount,
}
