import { useEffect, useState } from "react"
import { TOKEN_META } from "../config";
import { SolanaIcon } from "./svgIcons";
import { WalletContextState } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useRouter } from "next/router";
import CopyClipboard from "./CopyClipbord";
import moment from "moment";

export default function SalesHistoryRow(props: {
    tokenAddress: string,
    getLists: Function,
    icon: string,
    name: string,
    quantity: number,
    keyword: string,
    tx: string,
    price: string,
    buyer: string,
    createTimeStamp: number,
    wallet: WalletContextState,
    isMine?: boolean
}) {
    const router = useRouter();
    const { tokenAddress, tx, createTimeStamp, buyer, quantity, wallet, price, icon, name } = props;
    useEffect(() => {
        // eslint-disable-next-line
    }, [])
    return (
        ((name + tokenAddress + wallet.publicKey?.toBase58()).toLowerCase().indexOf(props.keyword.toLowerCase()) !== -1 ?
            <tr >
                <td>
                    <div className="table-title-cell">
                        <Link href={"/token/" + tokenAddress}>
                            <a>
                                {/* eslint-disable-next-line */}
                                <img
                                    src={icon ? icon : "/img/unknown-icon.png"}
                                    alt=""
                                />
                                <h5>{name}</h5>
                            </a>
                        </Link>
                    </div>
                </td>
                <td>
                    <div className="price-cell">
                        <div className="price-cell-quantiry">
                            <CopyClipboard text={tx}>
                                {tx.slice(0, 6)}...{tx.slice(-6)}
                            </CopyClipboard>
                        </div>
                    </div>
                </td>
                <td align="left">
                    <span title={moment(createTimeStamp).format()}>
                        {moment(createTimeStamp).fromNow()}
                    </span>
                </td>
                {/* buyer */}
                {!props.isMine &&
                    <td align="left">
                        <CopyClipboard text={buyer}>
                            <span>
                                {buyer.slice(0, 6)}...{buyer.slice(-6)}
                            </span>
                        </CopyClipboard>
                    </td>
                }
                <td align="left">
                    <span>
                        {quantity}◎{price}
                    </span>
                </td>
            </tr >
            :
            <>
            </>
        )
    )
}
