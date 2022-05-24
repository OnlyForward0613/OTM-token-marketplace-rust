use anchor_lang::prelude::*;

#[error_code]
pub enum OTMError {
    #[msg("Invalid Lister")]
    InvalidLister,
    #[msg("Invalid Token")]
    InvalidToken,
    #[msg("Invalid Serve Wallet")]
    InvalidService,
    #[msg("Overflow Token")]
    OverflowToken,
}
