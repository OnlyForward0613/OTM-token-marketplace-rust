import { PublicKey } from "@solana/web3.js";

export const NETWORK = "devnet"
export const ADMIN_LIST = [
  {
    address: "3DEjA83G8z4CnTGBuynMeQNu8KNdsKutSUyhUBLxtpqW",
  },
  {
    address: "Fe4KejEc1pgo6MxjfRGYL1u5qMpYN7FMxPKYjbrdsFFE",
  }
]

export const TOKEN_ACCOUNT = "https://public-api.solscan.io/account/";
export const TOKEN_META = "https://public-api.solscan.io/token/meta?tokenAddress=";

export const firebaseConfig = {
  apiKey: "AIzaSyD0Nn-imzOhRsXs8aqFyR5hwMQLsQnRvQc",
  authDomain: "otm-coinmarketplace.firebaseapp.com",
  projectId: "otm-coinmarketplace",
  storageBucket: "otm-coinmarketplace.appspot.com",
  messagingSenderId: "219970397835",
  appId: "1:219970397835:web:61a6bd3aa491433def568e",
  measurementId: "G-SS0GMV3J3B"
};

export const EMPTY_ADDRESS = "11111111111111111111111111111111111111111111"

export const PROGRAM_ID = "BThh28ELg1UhsZwJshoJiCWqbH4WfzLVd6zJNecrTMTV";
export const TREASURY_WALLET = new PublicKey("32NL69SFk8GLPFZfKQwsuexcXHd7rqAQn1mrasF1ksVj");

export const LIST_SIZE = 96;
export const DECIMALS = 1_000_000_000;