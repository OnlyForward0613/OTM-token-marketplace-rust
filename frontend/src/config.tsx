import { PublicKey } from "@solana/web3.js";

export const NETWORK = "devnet"
export const ADMIN_LIST = [
  {
    address: "3DEjA83G8z4CnTGBuynMeQNu8KNdsKutSUyhUBLxtpqW"
  }
]

export const TOKEN_ACCOUNT = "https://public-api.solscan.io/account/";
export const TOKEN_META = "https://public-api.solscan.io/token/meta?tokenAddress=";

export const firebaseConfig = {
  apiKey: "AIzaSyDsVP46x_Tze43MT4pqRxGA7XuicEdz5MA",
  authDomain: "otm-marketplace.firebaseapp.com",
  projectId: "otm-marketplace",
  storageBucket: "otm-marketplace.appspot.com",
  messagingSenderId: "393270249819",
  appId: "1:393270249819:web:2267c3f7ccb9f924fff27e",
  measurementId: "G-2LZKEH7M5M"
};

export const EMPTY_ADDRESS = "11111111111111111111111111111111111111111111"

export const PROGRAM_ID = "2beT9QL7MdcmtpmRgX926XYukCdGXjVFr656CMKqHYAe";
export const TREASURY_WALLET = new PublicKey("32NL69SFk8GLPFZfKQwsuexcXHd7rqAQn1mrasF1ksVj");

export const LIST_SIZE = 96;
export const DECIMALS = 1000000000;