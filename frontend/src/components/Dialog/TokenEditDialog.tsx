import { Dialog } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TOKEN_ACCOUNT, TOKEN_META } from "../../config";
import { CloseIcon } from "../svgIcons";
import { addDoc, doc, updateDoc } from "firebase/firestore";
import { tokenInstance } from "../../firebase/marketOperation";
import { useWallet } from "@solana/wallet-adapter-react";
import { successAlert } from "../toastGroup";
import { database } from "../../firebase/firebaseConfig";
export default function TokenEditDialog(props: {
    opened: boolean,
    title: string,
    onClose: Function,
    tokenId: string,
    tokenAddress: string,
    creatorAddress: string
    creatorFee: string,
    twitter: string,
    getTokens: Function
}) {
    const wallet = useWallet();
    const { opened, title, onClose, tokenId, tokenAddress, getTokens } = props;

    const [twitter, setTwitter] = useState(props.twitter);
    const [creatorFee, setCreatorFee] = useState(props.creatorFee);
    const [creatorAddress, setCreatorAddress] = useState(props.creatorAddress);

    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [icon, setIcon] = useState("/img/unknown-icon.png");
    const [website, setWebsite] = useState("");
    const [holders, setHolders] = useState("");
    const [price, setPrice] = useState("");
    const [supply, setSupply] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);

    const getTokenDetail = () => {
        setIsLoading(true);
        fetch(TOKEN_META + tokenAddress)
            .then(response => response.text())
            .then(result => {
                const res = JSON.parse(result);
                if (!res.address) {
                    setIsInvalid(true)
                } else {
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
                if (res.status) {
                    setIsInvalid(true)
                } else {
                    setPrice(res.tokenInfo.price);
                    const supy = (parseFloat(res.tokenInfo.supply) / Math.pow(10, res.tokenInfo.decimals)).toLocaleString()
                    setSupply(supy)
                }
            })
            .catch(error => console.log('error', error));
        setIsLoading(false);
    }

    const saveToken = () => {
        const collectionById = doc(database, 'tokens', tokenId)
        updateDoc(collectionById, {
            creatorFee: creatorFee,
            creatorAddress: creatorAddress,
            twitter: twitter,
            updateTimeStamp: new Date().getTime()
        })
            .then(() => {
                successAlert("Edit success!");
                onClose();
                getTokens();
            })
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect(() => {
        getTokenDetail();
        // eslint-disable-next-line
    }, [])

    return (
        <Dialog
            open={opened}
            onClose={() => onClose()}
            maxWidth="sm"
        >
            <div className="token-dialog">
                <div className="token-dialog-header">
                    <h2>{title}</h2>
                    <h3>{tokenAddress}</h3>
                    <button className="btn-close" onClick={() => onClose()}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="token-dialog-content">
                    <div className="row">
                        <div className="col-full">
                            <div className="market-overview">
                                <div className="token-symbol">
                                    {/* eslint-disable-next-line */}
                                    <img
                                        src={icon}
                                        alt=""
                                    />
                                    <h2>{name} - {symbol}</h2>
                                </div>
                                <h3>Market Overview</h3>
                                <div className="overview-item">
                                    <label className="title">Price</label>
                                    <p className="value">{price}</p>
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
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-full">
                            <div className="form-control">
                                <label>Creator Address</label>
                                <input
                                    value={creatorAddress}
                                    onChange={(e: any) => setCreatorAddress(e.target.value)}
                                    className="input-mini"
                                    placeholder="Input creator address"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="col-full">
                            <div className="form-control">
                                <label>Creator Fee %</label>
                                <input
                                    value={creatorFee}
                                    onChange={(e: any) => setCreatorFee(e.target.value)}
                                    className="input-mini"
                                    disabled={creatorAddress === ""}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="col-full">
                            <div className="form-control">
                                <label>Twitter</label>
                                <input
                                    value={twitter}
                                    onChange={(e: any) => setTwitter(e.target.value)}
                                    className="input-mini"
                                    placeholder="https://twitter.com/"
                                />
                            </div>
                        </div>
                        <div className="col-half">
                            <button className="btn-save" onClick={() => saveToken()}>
                                Save
                            </button>
                        </div>
                        <div className="col-half">
                            <button className="btn-cancel" onClick={() => onClose()}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}