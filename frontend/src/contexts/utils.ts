import { web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { ADMIN_LIST, NETWORK } from '../config';

export const solConnection = new web3.Connection(web3.clusterApiUrl(NETWORK));

export const adminValidation = (wallet: WalletContextState) => {
    let res = false;
    if (wallet.publicKey === null) return false;
    const address = wallet.publicKey;
    for (let item of ADMIN_LIST) {
        res = res || (item.address === address.toBase58())
    }
    return res
}

export const getSPLTokensInfo = async (wallet: WalletContextState) => {
    if (wallet.publicKey === null) return;
    const res = await solConnection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID });
    let spls: any = [];
    if (res.value.length !== 0) {
        for (let item of res.value) {
            if (item.account.data.parsed.info.tokenAmount.decimals !== 0)
                spls.push({
                    tokenAddress: item.account.data.parsed.info.mint,
                    amount: item.account.data.parsed.info.tokenAmount.amount,
                    decimals: item.account.data.parsed.info.tokenAmount.decimals,
                    uiAmount: item.account.data.parsed.info.tokenAmount.uiAmount,
                    uiAmountString: item.account.data.parsed.info.tokenAmount.uiAmountString,
                })
        }
    }
    return spls
}