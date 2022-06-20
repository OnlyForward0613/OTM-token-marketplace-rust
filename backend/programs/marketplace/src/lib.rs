use anchor_lang::{prelude::*, AccountSerialize};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer},
};
use solana_program::entrypoint::ProgramResult;
use solana_program::pubkey::Pubkey;
use spl_token::instruction::*;

pub mod account;
pub mod constants;
pub mod error;
pub mod utils;

use account::*;
use constants::*;
use error::*;
use utils::*;

declare_id!("7SN8mRUkP2XbNgvzkKbbcRvhafvGLCd5WAZXVV2qxQs");

#[program]
pub mod marketplace {
    use super::*;

    pub fn list_token(
        ctx: Context<ListToken>,
        bump: u8,
        price: u64,
        amount: u64,
        decimals: u64,
    ) -> ProgramResult {
        let token_list: &mut Account<TokenList> = &mut ctx.accounts.token_list;
        let lister = &mut &ctx.accounts.lister;
        let token_mint = &mut ctx.accounts.token_mint;
        let total_amount = amount * decimals;

        let token_account_info = &mut &ctx.accounts.lister_token_account;
        let dest_token_account_info = &mut &ctx.accounts.vault_account;
        let token_program = &mut &ctx.accounts.token_program;

        let cpi_accounts = Transfer {
            from: token_account_info.to_account_info().clone(),
            to: dest_token_account_info.to_account_info().clone(),
            authority: ctx.accounts.lister.to_account_info().clone(),
        };
        token::transfer(
            CpiContext::new(token_program.clone().to_account_info(), cpi_accounts),
            total_amount,
        )?;

        token_list.lister = lister.key();
        token_list.token_address = token_mint.key();
        token_list.price = price;
        token_list.amount += amount;
        token_list.decimals = decimals;

        Ok(())
    }

    pub fn delist(ctx: Context<Delist>, bump: u8) -> Result<()> {
        let token_list = &mut ctx.accounts.token_list;

        if ctx.accounts.lister.key() != token_list.lister {
            return Err(error!(OTMError::InvalidLister));
        }
        if ctx.accounts.token_mint.key() != token_list.token_address {
            return Err(error!(OTMError::InvalidToken));
        }
        let amount = token_list.amount * token_list.decimals;

        let src_token_account_info = &mut &ctx.accounts.vault_account;
        let dest_token_account_info = &mut &ctx.accounts.lister_token_account;
        let token_program = &mut &ctx.accounts.token_program;
        let seeds = &[
            token_list.lister.as_ref(),
            token_list.token_address.as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: src_token_account_info.to_account_info(),
            to: dest_token_account_info.to_account_info(),
            authority: token_list.to_account_info().clone(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                token_program.clone().to_account_info(),
                cpi_accounts,
                signer,
            ),
            amount,
        )?;
        token_list.amount = 0;

        Ok(())
    }

    pub fn update(ctx: Context<Update>, bump: u8, new_amount: u64) -> Result<()> {
        let token_list = &mut ctx.accounts.token_list;
        let amount = token_list.amount;

        if ctx.accounts.lister.key() != token_list.lister {
            return Err(error!(OTMError::InvalidLister));
        }
        if ctx.accounts.token_mint.key() != token_list.token_address {
            return Err(error!(OTMError::InvalidToken));
        }

        let src_token_account_info = &mut &ctx.accounts.vault_account;
        let dest_token_account_info = &mut &ctx.accounts.lister_token_account;
        let token_program = &mut &ctx.accounts.token_program;

        if new_amount > amount {
            let def_amount = (new_amount - amount) * token_list.decimals;
            let cpi_accounts = Transfer {
                from: dest_token_account_info.to_account_info().clone(),
                to: src_token_account_info.to_account_info().clone(),
                authority: ctx.accounts.lister.to_account_info().clone(),
            };
            token::transfer(
                CpiContext::new(token_program.clone().to_account_info(), cpi_accounts),
                def_amount,
            )?;
        } else {
            let seeds = &[
                token_list.lister.as_ref(),
                token_list.token_address.as_ref(),
                &[bump],
            ];
            let signer = &[&seeds[..]];
            let def_amount = (amount - new_amount) * token_list.decimals;
            let cpi_accounts = Transfer {
                from: src_token_account_info.to_account_info(),
                to: dest_token_account_info.to_account_info(),
                authority: token_list.to_account_info().clone(),
            };
            token::transfer(
                CpiContext::new_with_signer(
                    token_program.clone().to_account_info(),
                    cpi_accounts,
                    signer,
                ),
                def_amount,
            )?;
        }
        token_list.amount = new_amount;
        Ok(())
    }

    pub fn buy(ctx: Context<BuyToken>, bump: u8, artist_fee: u64, amount: u64) -> Result<()> {
        let token_list = &mut ctx.accounts.token_list;
        if amount > token_list.amount {
            return Err(error!(OTMError::OverflowToken));
        }

        if ctx.accounts.lister.key() != token_list.lister {
            return Err(error!(OTMError::InvalidLister));
        }

        if ctx.accounts.treasury_wallet.key() != SERVICE_WALLET.parse::<Pubkey>().unwrap() {
            return Err(error!(OTMError::InvalidService));
        }
        let price = token_list.price;
        let total_price = price * amount;
        let mut artist_price = 0;
        if artist_fee > 0 {
            artist_price = total_price * artist_fee / 100;
            sol_transfer_user(
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                artist_price,
            )?;
        }
        let treasury_price = total_price * SERVICE_FEE / 100;
        sol_transfer_user(
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.treasury_wallet.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            treasury_price,
        )?;

        let main_price = total_price - artist_price - treasury_price;

        sol_transfer_user(
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.lister.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            main_price,
        )?;

        let total_amount = amount * token_list.decimals;
        let src_token_account_info = &mut &ctx.accounts.vault_account;
        let dest_token_account_info = &mut &ctx.accounts.buyer_token_account;
        let token_program = &mut &ctx.accounts.token_program;
        let seeds = &[
            token_list.lister.as_ref(),
            token_list.token_address.as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: src_token_account_info.to_account_info(),
            to: dest_token_account_info.to_account_info(),
            authority: token_list.to_account_info().clone(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                token_program.clone().to_account_info(),
                cpi_accounts,
                signer,
            ),
            total_amount,
        )?;
        token_list.amount -= amount;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct ListToken<'info> {
    #[account(mut)]
    pub lister: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [lister.key().as_ref(), token_mint.key().as_ref()],
        bump,
        payer = lister,
        space = TokenList::LEN)]
    pub token_list: Account<'info, TokenList>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_mint: AccountInfo<'info>,

    #[account(
        mut,
        constraint = lister_token_account.mint == token_mint.key(),
        constraint = lister_token_account.owner == lister.key()
    )]
    pub lister_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_account.mint == token_mint.key(),
        constraint = vault_account.owner == token_list.key()
    )]
    pub vault_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Delist<'info> {
    #[account(mut)]
    pub lister: Signer<'info>,

    #[account(mut)]
    pub token_list: Account<'info, TokenList>,

    #[account(
        mut,
        constraint = lister_token_account.mint == token_mint.key(),
        constraint = lister_token_account.owner == lister.key()
    )]
    pub lister_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_account.mint == token_mint.key(),
        constraint = vault_account.owner == token_list.key()
    )]
    pub vault_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_mint: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Update<'info> {
    #[account(mut)]
    pub lister: Signer<'info>,

    #[account(mut)]
    pub token_list: Account<'info, TokenList>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_mint: AccountInfo<'info>,

    #[account(
        mut,
        constraint = lister_token_account.mint == token_mint.key(),
        constraint = lister_token_account.owner == lister.key()
    )]
    pub lister_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_account.mint == token_mint.key(),
        constraint = vault_account.owner == token_list.key()
    )]
    pub vault_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct BuyToken<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub token_list: Account<'info, TokenList>,

    #[account(
        mut,
        constraint = buyer_token_account.mint == token_mint.key(),
        constraint = buyer_token_account.owner == buyer.key()
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_account.mint == token_mint.key(),
        constraint = vault_account.owner == token_list.key()
    )]
    pub vault_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_mint: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub lister: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub creator: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub treasury_wallet: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
