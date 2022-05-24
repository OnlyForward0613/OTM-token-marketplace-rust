# OTM_token_marketplace
This is the token_marketplace that the users can list their spl-tokens and buy them paying SOL

## Install Dependencies
- Install `node` and `yarn`
- Install `ts-node` as global command
- Confirm the solana wallet preparation: `/home/fury/.config/solana/id.json` in test case

## Usage
- Main script source for all functionality is here: `/cli/script.ts`
- Program account types are declared here: `/cli/types.ts`
- Idl to make the JS binding easy is here: `/cli/raffle.json`

Able to test the script functions working in this way.
- Change commands properly in the main functions of the `script.ts` file to call the other functions
- Confirm the `ANCHOR_WALLET` environment variable of the `ts-node` script in `package.json`
- Run `yarn ts-node`

## Features

### - As the Lister of the Tokens
The listers can list their tokens at the price as they want.

```js
export const listToken = async (
    userAddress: PublicKey,
    tokenMint: PublicKey,
    price: number,
    amount: number
)
```

The lister can also delist and update their condition by using these functions.

```js
export const delist = async (
    userAddress: PublicKey,
    tokenListkey: PublicKey,
) 
```
```js
export const update = async (
    userAddress: PublicKey,
    tokenListkey: PublicKey,
    newAmount: number,
)
```

### - As the Buyer
Users can buy the tokens at the listed price.

```js
export const buy = async (
    userAddress: PublicKey,
    tokenListkey: PublicKey,
    creatorAddress: PublicKey,
    artistFee: number,
    amount: number
)
```
