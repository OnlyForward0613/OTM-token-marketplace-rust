
import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export interface FatchedTokenType {
    address: string;
    createTimeStamp: number;
    creatorAddress: string;
    creatorFee: string;
    twitter: string;
    updateTimeStamp: number;
}
export interface UserTokenType {
    amount: string;
    decimals: number;
    tokenAddress: string;
    uiAmount: number;
    uiAmountString: string;
    tokenId?: string;
}

export interface ListedTokenType {
    floorPrice: number;
    icon: string;
    name: string;
    quantity: number;
    tokenAddress: string;
}

export interface FetchedListItemType {
    amount: string;
    createTimeStamp: number;
    id: string;
    pda: string;
    price: string;
    state: number;
    tokenAddress: string;
    tx: string;
    type: string;
    updateTimeStamp: number;
    userAddress: string;
}

export interface TokenList {
    lister: PublicKey,
    tokenAddress: PublicKey,
    price: anchor.BN,
    decimals: anchor.BN,
    amount: anchor.BN
}