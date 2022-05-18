import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export interface TokenList {
    lister: PublicKey,
    tokenAddress: PublicKey,
    price: anchor.BN,
    amount: anchor.BN
}