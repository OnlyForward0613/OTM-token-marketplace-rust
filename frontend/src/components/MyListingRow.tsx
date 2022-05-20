import { useEffect, useState } from "react"
import { TOKEN_META } from "../config";
import { SolanaIcon, TrashIcon } from "./svgIcons";
import { WalletContextState } from "@solana/wallet-adapter-react";
import Link from "next/link";
import CopyClipboard from "./CopyClipbord";
import ListingEditDialog from "./Dialog/ListingEditDialog";
import { Dialog } from "@mui/material";
import { delist } from "../contexts/transaction";
import { PublicKey } from "@solana/web3.js";

export default function MyListingRow(props: {
    tokenAddress: string,
    getLists: Function,
    icon: string,
    name: string,
    quantity: number,
    keyword: string,
    listedId: string,
    tx: string,
    price: string,
    pda: string,
    wallet: WalletContextState,
    startLoading: Function,
    closeLoading: Function,
}) {
    const { tokenAddress, listedId, quantity, wallet, price, icon, name, getLists, pda, startLoading, closeLoading } = props;
    const [editDialog, setEditDialog] = useState(false);
    const [removeAlert, setRemoveAlert] = useState(false);
    const handleRemove = async () => {
        setRemoveAlert(false);
        try {
            await delist(wallet, new PublicKey(pda), listedId, () => startLoading(), () => closeLoading(), () => getLists());
        } catch (error) {
            console.log(error)
        }
    }

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
                            <CopyClipboard text={tokenAddress}>
                                {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-6)}
                            </CopyClipboard>
                        </div>
                    </div>
                </td>
                <td align="left">
                    <span>
                        {quantity}
                    </span>
                </td>
                <td align="left">
                    <span>
                        {price}◎
                    </span>
                </td>
                <td align="center" style={{ display: "flex", justifyContent: "center" }}>
                    {wallet.publicKey !== null &&
                        <>
                            <button className="btn-outline" onClick={() => setEditDialog(true)}>
                                Edit
                            </button>
                            <button className="btn-outline btn-remove" onClick={() => setRemoveAlert(true)}>
                                <TrashIcon />
                            </button>
                        </>
                    }
                    <ListingEditDialog
                        opened={editDialog}
                        onClose={() => setEditDialog(false)}
                        wallet={wallet}
                        tokenAddress={tokenAddress}
                        quantity={quantity}
                        price={parseFloat(price)}
                        pda={pda}
                        listedId={listedId}
                        updateTable={getLists}
                    />
                    <RemoveAlert
                        opened={removeAlert}
                        onClose={() => setRemoveAlert(false)}
                        handleRemove={() => handleRemove()}
                    />
                </td>
            </tr>
            :
            <>
            </>
        )
    )
}
const RemoveAlert = (props: { opened: boolean, onClose: Function, handleRemove: Function }) => {
    return (
        <Dialog
            open={props.opened}
            onClose={() => props.onClose()}
        >
            <div className="remove-dialog">
                <h2>Are you sure you want to delete this list?</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ac risus quis urna venenatis dapibus ullamcorper sed metus. </p>
                <div className="modal-action">
                    <button className="dialog-cancel" onClick={() => props.onClose()}>cancel</button>
                    <button className="dialog-remove" onClick={() => props.handleRemove()}>remove</button>
                </div>
            </div>
        </Dialog>
    )
}