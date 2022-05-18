use anchor_lang::prelude::*;
use std::clone::Clone;
use std::result::Result;

use crate::constants::*;
use crate::error::*;

#[account]
pub struct TokenList {
    pub lister: Pubkey,
    pub token_address: Pubkey,
    pub price: u64,
    pub amount: u64,
    pub decimals: u64,
}

pub const DISCRIMINATOR_LENGTH: usize = 8;
pub const PUBLIC_KEY_LENGTH: usize = 32;
pub const U64_LENGTH: usize = 8;

impl TokenList {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH
        + PUBLIC_KEY_LENGTH
        + U64_LENGTH
        + U64_LENGTH
        + U64_LENGTH;
}
