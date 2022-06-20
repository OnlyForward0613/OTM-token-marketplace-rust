import * as anchor from '@project-serum/anchor';
import {
    Connection,
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
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { listInstance, salesInstance } from '../firebase/marketOperation';
import { database, db } from '../firebase/firebaseConfig';

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
        let lastAmount = 0;
        getDocs(listInstance)
            .then(async (data) => {
                const lists = (data.docs.map((item: any) => {
                    return ({ ...item.data(), id: item.id })
                }))
                if (lists.length !== 0) {

                    let result = lists.reduce(function (r: any, a: any) {
                        r[a.tokenAddress] = r[a.tokenAddress] || [];
                        r[a.tokenAddress].push(a);
                        return r;
                    }, Object.create(null));
                    let filtered = [];
                    for (let item of Object.keys(result)) {
                        if (item === tokenMint.toBase58()) {
                            let listData = result[item];
                            for (let item of listData) {
                                if (item.amount !== 0) {
                                    filtered.push(item)
                                }
                            }
                        }
                    }
                    let checkFlag = false;
                    for (let item of filtered) {
                        if (item.userAddress === wallet.publicKey?.toBase58()) {
                            lastAmount = item.amount;
                            const totalAmount = parseFloat(lastAmount.toString()) + parseFloat(amount.toString());
                            const collectionById = doc(database, 'listings', item.id);
                            await deleteDoc(collectionById)
                                .then(async () => {
                                    await addDoc(listInstance, {
                                        userAddress: wallet.publicKey?.toBase58(),
                                        tokenAddress: tokenMint.toBase58(),
                                        amount: totalAmount,
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
                                            checkFlag = true;
                                            console.log(checkFlag, "===> checkFlag 1")
                                        })
                                        .catch((error) => {
                                            console.log(error)
                                        })
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                        }
                    }
                    if (!checkFlag) {
                        console.log(checkFlag, "===> checkFlag 2")
                        await addDoc(listInstance, {
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
                    }
                } else {
                    await addDoc(listInstance, {
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
                }
            }).catch((error) => {
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
    updatePage: Function,
    openDeny: Function,
    closeDeny: Function
) => {
    if (wallet.publicKey === null) return;
    startLoading();
    openDeny();
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
        await deleteDoc(collectionById)
            .then(() => {
                successAlert("Remove success!");
                updatePage();
            })
            .catch((error) => {
                console.log(error)
            })
        closeLoading();
        closeDeny();
    } catch (error) {
        closeLoading();
        closeDeny();
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
                // successAlert("Buy successful!");
                console.log("sales saved on db");
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
        await solConnection.confirmTransaction(txId, "finalized");
        successAlert("Transaction confirmed");
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

export const updateDbData = async () => {
    const chainData = await getGlobalData();
    getDocs(listInstance)
        .then(async (data) => {
            const tokensDB = (data.docs.map((item: any) => {
                return ({ ...item.data(), id: item.id })
            }));
            if (chainData.length !== 0) {
                for (let chinItem of chainData) {
                    const machedItem = tokensDB.find((x: any) => x.pda === chinItem.pda);
                    if (machedItem) {
                        // console.log(machedItem, "===> mached item")
                        if (chinItem.amount !== machedItem.amount) {
                            console.log(chainData, "===> chaindata")
                            const collectionById = doc(database, 'listings', chinItem.id);
                            updateDoc(collectionById, {
                                amount: machedItem.amount,
                                updateTimeStamp: new Date().getTime()
                            })
                                .then(() => {
                                    console.log("DB updated");
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                        }
                    } else {
                        await addDoc(listInstance, {
                            userAddress: chinItem.lister,
                            tokenAddress: chinItem.tokenAddress,
                            amount: chinItem.amount.toString(),
                            price: chinItem.price,
                            type: "sol",
                            createTimeStamp: new Date().getTime(),
                            updateTimeStamp: new Date().getTime(),
                            pda: chinItem.pda,
                            tx: "",
                            state: 0
                        })
                            .then(() => {
                                console.log("Added missing listing data")
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    }
                }
            }
        }).catch((error) => {
            console.log(error)
        })
}

export const getGlobalData = async () => {
    const list = await getListAccount();
    let globalData: any = [];
    for (let item of list) {
        const tokenData = await getStateByKey(item);
        if (tokenData)
            globalData.push(
                {
                    amount: tokenData.amount.toNumber(),
                    decimals: tokenData.decimals.toNumber(),
                    lister: tokenData.lister.toBase58(),
                    price: tokenData.price.toNumber() / tokenData.decimals.toNumber(),
                    tokenAddress: tokenData.tokenAddress.toBase58(),
                    pda: item.toBase58()
                }
            );
    }
    return globalData;
}


export const getListAccount = async (): Promise<PublicKey[]> => {
    let tokenAccount = await solConnection.getProgramAccounts(
        new PublicKey(PROGRAM_ID),
        {
            filters: [
                {
                    dataSize: 96
                },
            ]
        }
    );
    let listaccounts: PublicKey[] = [];
    for (let i = 0; i < tokenAccount.length; i++) {
        listaccounts.push(tokenAccount[i].pubkey);
    }

    return listaccounts;
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