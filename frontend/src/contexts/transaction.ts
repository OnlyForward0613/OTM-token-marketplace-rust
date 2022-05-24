import * as anchor from '@project-serum/anchor';
import {
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    ParsedAccountData,
    Transaction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletContextState } from '@solana/wallet-adapter-react';
import { solConnection } from './utils';
import { DECIMALS, PROGRAM_ID, TREASURY_WALLET } from '../config';
import { IDL } from './marketplace';
import { TokenList } from './types';
import { successAlert } from '../components/toastGroup';
import { addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { listInstance, salesInstance } from '../firebase/marketOperation';
import { database } from '../firebase/firebaseConfig';

export const listToken = async (
    wallet: WalletContextState,
    tokenMint: PublicKey,
    price: number,
    amount: number,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function
) => {
    if (wallet.publicKey === null) return;
    startLoading()
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const userAddress = wallet.publicKey;

    try {
        const [tokenList, bump] = await PublicKey.findProgramAddress(
            [userAddress.toBytes(), tokenMint.toBytes()],
            program.programId
        );

        let listerTokenAccount = await getAssociatedTokenAccount(userAddress, tokenMint);
        let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
            solConnection,
            userAddress,
            tokenList, //pda
            [tokenMint]
        );

        let TOKEN_DECIMALS = await getDecimals(userAddress, tokenMint);
        if (TOKEN_DECIMALS === null) return;
        const tx = new Transaction();
        if (instructions.length !== 0) {
            tx.add(...instructions)
        }
        tx.add(program.instruction.listToken(
            bump,
            new anchor.BN(price * DECIMALS),
            new anchor.BN(amount),
            new anchor.BN(TOKEN_DECIMALS), {
            accounts: {
                lister: userAddress,
                tokenList,
                tokenMint,
                listerTokenAccount,
                vaultAccount: destinationAccounts[0],
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            },
            instructions: [
                ...instructions,
            ],
            signers: [],
        }
        ))
        const txId = await wallet.sendTransaction(tx, solConnection);
        await solConnection.confirmTransaction(txId, "finalized");
        successAlert("Transaction confirmed");

        addDoc(listInstance, {
            userAddress: wallet.publicKey?.toBase58(),
            tokenAddress: tokenMint.toBase58(),
            amount: amount,
            price: price,
            type: "sol",
            createTimeStamp: new Date().getTime(),
            updateTimeStamp: new Date().getTime(),
            pda: tokenList.toBase58(),
            tx: txId,
            state: 0
        })
            .then(() => {
                successAlert("Stored in database");
            })
            .catch((error) => {
                console.log(error)
            })
        closeLoading();
        updatePage();
    } catch (error) {
        closeLoading();
        console.log(error)
    }
}

export const delist = async (
    wallet: WalletContextState,
    tokenListkey: PublicKey,
    listedId: string,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function
) => {
    if (wallet.publicKey === null) return;
    startLoading()
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const userAddress = wallet.publicKey;
    try {
        const state: TokenList | null = await getStateByKey(tokenListkey);
        if (state === null) return;
        let tokenMint = state.tokenAddress;
        const [tokenList, bump] = await PublicKey.findProgramAddress(
            [userAddress.toBytes(), tokenMint.toBytes()],
            program.programId
        );

        let listerTokenAccount = await getAssociatedTokenAccount(userAddress, tokenMint);
        let vaultAccount = await getAssociatedTokenAccount(tokenListkey, tokenMint);
        let tx = new Transaction();
        tx.add(program.instruction.delist(
            bump, {
            accounts: {
                lister: userAddress,
                tokenList: tokenListkey,
                listerTokenAccount,
                vaultAccount,
                tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            instructions: [],
            signers: [],
        }
        ))
        const txId = await wallet.sendTransaction(tx, solConnection);
        await solConnection.confirmTransaction(txId, "finalized");
        successAlert("Transaction confirmed");

        const collectionById = doc(database, 'listings', listedId)
        deleteDoc(collectionById)
            .then(() => {
                successAlert("Remove success!");
                updatePage();
            })
            .catch((error) => {
                console.log(error)
            })
        closeLoading();
    } catch (error) {
        closeLoading();
        console.log(error)
    }
}

export const update = async (
    wallet: WalletContextState,
    tokenListkey: PublicKey,
    newAmount: number,
    listedId: string,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function
) => {
    if (wallet.publicKey === null) return;
    startLoading();
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const userAddress = wallet.publicKey;
    try {
        const state: TokenList | null = await getStateByKey(tokenListkey);
        if (state === null) return;
        let tokenMint = state.tokenAddress;
        const [tokenListK, bump] = await PublicKey.findProgramAddress(
            [userAddress.toBytes(), tokenMint.toBytes()],
            program.programId
        );
        let listerTokenAccount = await getAssociatedTokenAccount(userAddress, tokenMint);
        let vaultAccount = await getAssociatedTokenAccount(tokenListkey, tokenMint);
        let tx = new Transaction()
        tx.add(program.instruction.update(
            bump, new anchor.BN(newAmount), {
            accounts: {
                lister: userAddress,
                tokenList: tokenListkey,
                tokenMint,
                listerTokenAccount,
                vaultAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            instructions: [],
            signers: [],
        }
        ))
        const txId = await wallet.sendTransaction(tx, solConnection);
        await solConnection.confirmTransaction(txId, "finalized");
        successAlert("Transaction confirmed");

        const collectionById = doc(database, 'listings', listedId)
        updateDoc(collectionById, {
            amount: newAmount,
            updateTimeStamp: new Date().getTime()
        })
            .then(() => {
                successAlert("Stored in database");
            })
            .catch((error) => {
                console.log(error)
            })

        closeLoading();
        updatePage()
    } catch (error) {
        closeLoading();
        console.log(error)
    }
}

export const buy = async (
    wallet: WalletContextState,
    tokenListkey: PublicKey,
    creatorAddress: PublicKey,
    artistFee: number,
    amount: number,
    tokenAddress: string,
    price: number,
    listId: string,
    qty: number,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function
) => {
    if (wallet.publicKey === null) return;
    startLoading();
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const userAddress = wallet.publicKey;
    try {
        const state: TokenList | null = await getStateByKey(tokenListkey);
        if (state === null) return;
        let tokenMint = state.tokenAddress;
        let lister = state.lister;
        const [tokenListK, bump] = await PublicKey.findProgramAddress(
            [lister.toBytes(), tokenMint.toBytes()],
            program.programId
        );
        let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
            solConnection,
            userAddress,
            userAddress,
            [tokenMint]
        );

        let vaultAccount = await getAssociatedTokenAccount(tokenListkey, tokenMint);

        let tx = new Transaction();
        if (instructions.length !== 0) tx.add(...instructions)
        tx.add(program.instruction.buy(
            bump,
            new anchor.BN(artistFee),
            new anchor.BN(amount),
            {
                accounts: {
                    buyer: userAddress,
                    tokenList: tokenListkey,
                    buyerTokenAccount: destinationAccounts[0],
                    vaultAccount,
                    tokenMint,
                    lister,
                    creator: creatorAddress,
                    treasuryWallet: TREASURY_WALLET,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                },
                instructions: [],
                signers: [],
            }
        ))

        const txId = await wallet.sendTransaction(tx, solConnection);
        await solConnection.confirmTransaction(txId, "finalized");
        successAlert("Transaction confirmed");
        addDoc(salesInstance, {
            userAddress: wallet.publicKey.toBase58(),
            tokenAddress: tokenAddress,
            amount: amount,
            price: price,
            creator: creatorAddress.toBase58(),
            free: artistFee,
            pda: tokenListkey.toBase58(),
            tx: txId,
            state: 0,
            createTimeStamp: new Date().getTime(),
            updateTimeStamp: new Date().getTime(),
        })
            .then(() => {
                successAlert("Buy successful!");
            })
            .catch((error) => {
                console.log(error)
            })

        const collectionById = doc(database, 'listings', listId)
        updateDoc(collectionById, {
            amount: qty - amount,
            state: 1,
            updateTimeStamp: new Date().getTime()
        })
            .then(() => {
                updatePage();
            })
            .catch((error) => {
                console.log(error)
            })
        closeLoading();
        updatePage();
    } catch (error) {
        console.log(error)
        closeLoading();
    }

}

export const getStateByKey = async (
    tokenListKey: PublicKey
): Promise<TokenList | null> => {
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    try {
        let listState = await program.account.tokenList.fetch(tokenListKey);
        return listState as TokenList;
    } catch {
        return null;
    }
}

export const getDecimals = async (owner: PublicKey, tokenMint: PublicKey): Promise<number | null> => {
    try {
        let ownerTokenAccount = await getAssociatedTokenAccount(owner, tokenMint);
        const tokenAccount = await solConnection.getParsedAccountInfo(ownerTokenAccount);
        let decimal = (tokenAccount.value?.data as ParsedAccountData).parsed.info.tokenAmount.decimals;
        let DECIMALS = Math.pow(10, decimal);
        return DECIMALS;
    } catch {
        return null;
    }
}
const getAssociatedTokenAccount = async (ownerPubkey: PublicKey, mintPk: PublicKey): Promise<PublicKey> => {
    let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
        [
            ownerPubkey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintPk.toBuffer(), // mint address
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];
    return associatedTokenAccountPubkey;
}

export const getATokenAccountsNeedCreate = async (
    connection: anchor.web3.Connection,
    walletAddress: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    nfts: anchor.web3.PublicKey[],
) => {
    let instructions = [], destinationAccounts = [];
    for (const mint of nfts) {
        const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
        let response = await connection.getAccountInfo(destinationPubkey);
        if (!response) {
            const createATAIx = createAssociatedTokenAccountInstruction(
                destinationPubkey,
                walletAddress,
                owner,
                mint,
            );
            instructions.push(createATAIx);
        }
        destinationAccounts.push(destinationPubkey);
        if (walletAddress != owner) {
            const userAccount = await getAssociatedTokenAccount(walletAddress, mint);
            response = await connection.getAccountInfo(userAccount);
            if (!response) {
                const createATAIx = createAssociatedTokenAccountInstruction(
                    userAccount,
                    walletAddress,
                    walletAddress,
                    mint,
                );
                instructions.push(createATAIx);
            }
        }
    }
    return {
        instructions,
        destinationAccounts,
    };
}

export const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey,
    walletAddress: anchor.web3.PublicKey,
    splTokenMintAddress: anchor.web3.PublicKey
) => {
    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new anchor.web3.TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
}