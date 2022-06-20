import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog } from "@mui/material";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { TOKEN_ACCOUNT, TOKEN_META } from "../../config";
import { CloseIcon } from "../svgIcons";
import MarketOverviewSkeleton from "../MarketOverviewSkeleton";
import CopyClipboard from "../CopyClipbord";
import { update } from "../../contexts/transaction";
import { PublicKey } from "@solana/web3.js";

export default function ListingEditDialog(props: {
    opened: boolean,
    onClose: Function,
    wallet: WalletContextState,
    tokenAddress: string,
    quantity: number,
    price: number,
    pda: string,
    listedId: string,
    updateTable: Function
    openDeny: Function,
    closeDeny: Function
}) {
    const { opened, onClose, pda, price, quantity, listedId, tokenAddress, wallet, updateTable, } = props;
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [icon, setIcon] = useState("/img/unknown-icon.png");
    const [website, setWebsite] = useState("");
    const [holders, setHolders] = useState("");
    const [tokenPrice, setTokenPrice] = useState("");
    const [supply, setSupply] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [listPrice, setListPrice] = useState<number | undefined>(price);
    const [listAmount, setListAmount] = useState<number | undefined>(quantity);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleListAmount = (e: any) => {
        if (e.target.value)
            setListAmount(e.target.value)
    }
    const handleListPrice = (e: any) => {
        if (e.target.value)
            setListPrice(e.target.value)
    }
    const clearField = () => {
        onClose();
    }

    const getTokenDetail = () => {
        setIsLoading(true);
        fetch(TOKEN_META + tokenAddress)
            .then(response => response.text())
            .then(result => {
                const res = JSON.parse(result);
                if (res.address) {
                    setHolders(res.holder.toLocaleString());
                    setSymbol(res.symbol);
                    setName(res.name);
                    setIcon(res.icon);
                    setWebsite(res.website);
                }
            })
            .catch(error => console.log('error', error));

        fetch(TOKEN_ACCOUNT + tokenAddress)
            .then(response => response.text())
            .then(result => {
                const res = JSON.parse(result);
                if (!res.status) {
                    setTokenPrice(res.tokenInfo.price);
                    const supy = (parseFloat(res.tokenInfo.supply) / Math.pow(10, res.tokenInfo.decimals)).toLocaleString()
                    setSupply(supy)
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.log('error', error)
                setIsLoading(false);
            });
    }

    const updateState = () => {
        onClose();
        clearField();
        updateTable();
    }

    const startHandle = () => {
        setIsProcessing(true);
        props.openDeny();
    }

    const closeHandle = () => {
        setIsProcessing(false);
        props.closeDeny();
    }
    const handleUpdate = async () => {
        if (listAmount === undefined) return;
        try {
            await update(
                wallet,
                new PublicKey(pda),
                listAmount,
                listedId,
                () => startHandle(),
                () => closeHandle(),
                () => updateState()
            )
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (wallet.publicKey !== null) {
            getTokenDetail();
        }
        // eslint-disable-next-line
    }, [wallet.connected, opened])
    return (
        <Dialog
            open={opened}
            onClose={() => clearField()}
            fullWidth
            maxWidth="sm"
        >
            <div className="token-dialog">
                <div className="token-dialog-header">
                    <h2>Update your listing</h2>
                    <button className="btn-close" onClick={() => onClose()}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="token-dialog-content">
                    <div className="row">
                        <div className="col-full">
                            <h3 className="dialog-subtitle">
                                <CopyClipboard text={tokenAddress}>
                                    {tokenAddress}
                                </CopyClipboard>
                            </h3>
                        </div>
                        <div className="col-full" style={{ marginTop: 20 }}>
                            {!isLoading ?
                                <div className="market-overview">
                                    <div className="token-symbol">
                                        {/* eslint-disable-next-line */}
                                        <img
                                            src={icon}
                                            alt=""
                                        />
                                        <h2>
                                            {name === "" ?
                                                <>Unknown token</>
                                                :
                                                <>{name} - {symbol}</>
                                            }
                                        </h2>
                                    </div>
                                    <h3>Market Overview</h3>
                                    <div className="overview-item">
                                        <label className="title">Price</label>
                                        <p className="value">{tokenPrice}</p>
                                    </div>
                                    <div className="overview-item">
                                        <label className="title">Max Total Supply</label>
                                        <p className="value">{supply}</p>
                                    </div>
                                    <div className="overview-item">
                                        <label className="title">Holders</label>
                                        <p className="value">{holders}</p>
                                    </div>
                                    <div className="overview-item">
                                        <label className="title">Website</label>
                                        <Link href={website}>
                                            <a target="_blank">
                                                {website}
                                            </a>
                                        </Link>
                                    </div>
                                </div>
                                :
                                <MarketOverviewSkeleton />
                            }

                        </div>
                        <div className="col-half" style={{ marginTop: 20 }}>
                            <div className="form-control">
                                <label>Price Per Token</label>
                                <input
                                    value={listPrice}
                                    onChange={handleListPrice}
                                    disabled
                                    className="input-mini"
                                    placeholder="0.00 SOL"
                                />
                            </div>
                        </div>
                        <div className="col-half" style={{ marginTop: 20 }}>
                            <div className="form-control">
                                <label>Amount of Tokens</label>
                                <input
                                    value={listAmount}
                                    onChange={handleListAmount}
                                    className="input-mini"
                                    placeholder="Quantity"
                                />
                            </div>
                        </div>
                        <div className="col-full">
                            <p className="list-notice">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et tincidunt elit. Curabitur tincidunt rutrum urna id sagittis. Nam blandit nisl quis maximus lacinia. Phasellus non aliquam dolor, eget vehicula mi.
                            </p>
                        </div>
                        <div className="col-full">
                            <button className="btn-save" onClick={() => handleUpdate()} disabled={isProcessing}>
                                {!isProcessing ? "Save" : "Processing..."}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}