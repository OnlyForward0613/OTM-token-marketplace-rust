import { database } from "./firebaseConfig"
import { collection } from "firebase/firestore";

export const tokenInstance = collection(database, "tokens");
export const listInstance = collection(database, "listings");
export const salesInstance = collection(database, "sales");