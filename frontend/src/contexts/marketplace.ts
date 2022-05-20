export type MarketplaceType = {
    "version": "0.1.0",
    "name": "marketplace",
    "instructions": [
        {
            "name": "listToken",
            "accounts": [
                {
                    "name": "lister",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "tokenList",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "listerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "vaultAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "price",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "decimals",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "delist",
            "accounts": [
                {
                    "name": "lister",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "tokenList",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "listerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "vaultAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "update",
            "accounts": [
                {
                    "name": "lister",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "tokenList",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "listerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "vaultAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "newAmount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "buy",
            "accounts": [
                {
                    "name": "buyer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "tokenList",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "buyerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "vaultAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "lister",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "creator",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "treasuryWallet",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "artistFee",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "TokenList",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "lister",
                        "type": "publicKey"
                    },
                    {
                        "name": "tokenAddress",
                        "type": "publicKey"
                    },
                    {
                        "name": "price",
                        "type": "u64"
                    },
                    {
                        "name": "amount",
                        "type": "u64"
                    },
                    {
                        "name": "decimals",
                        "type": "u64"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidLister",
            "msg": "Invalid Lister"
        },
        {
            "code": 6001,
            "name": "InvalidToken",
            "msg": "Invalid Token"
        },
        {
            "code": 6002,
            "name": "InvalidService",
            "msg": "Invalid Serve Wallet"
        },
        {
            "code": 6003,
            "name": "OverflowToken",
            "msg": "Overflow Token"
        }
    ]
}
export const IDL: MarketplaceType = {
    "version": "0.1.0",
    "name": "marketplace",
    "instructions": [
        {
            "name": "listToken",
            "accounts": [
                {
                    "name": "lister",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "tokenList",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "listerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "vaultAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "price",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "decimals",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "delist",
            "accounts": [
                {
                    "name": "lister",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "tokenList",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "listerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "vaultAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "update",
            "accounts": [
                {
                    "name": "lister",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "tokenList",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "listerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "vaultAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "newAmount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "buy",
            "accounts": [
                {
                    "name": "buyer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "tokenList",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "buyerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "vaultAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "lister",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "creator",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "treasuryWallet",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "artistFee",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "TokenList",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "lister",
                        "type": "publicKey"
                    },
                    {
                        "name": "tokenAddress",
                        "type": "publicKey"
                    },
                    {
                        "name": "price",
                        "type": "u64"
                    },
                    {
                        "name": "amount",
                        "type": "u64"
                    },
                    {
                        "name": "decimals",
                        "type": "u64"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidLister",
            "msg": "Invalid Lister"
        },
        {
            "code": 6001,
            "name": "InvalidToken",
            "msg": "Invalid Token"
        },
        {
            "code": 6002,
            "name": "InvalidService",
            "msg": "Invalid Serve Wallet"
        },
        {
            "code": 6003,
            "name": "OverflowToken",
            "msg": "Overflow Token"
        }
    ]
}