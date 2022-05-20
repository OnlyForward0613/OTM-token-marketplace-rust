import { Dialog } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { TOKEN_ACCOUNT, TOKEN_META } from "../../config";
import { CloseIcon } from "../svgIcons";
import { addDoc } from "firebase/firestore";
import { tokenInstance } from "../../firebase/marketOperation";
import { useWallet } from "@solana/wallet-adapter-react";
import { successAlert } from "../toastGroup";
export default function TokenDialog(props: { opened: boolean, title: string, onClose: Function, getTokens: Function }) {
    const wallet = useWallet();
    const { opened, title, onClose, getTokens } = props;
    const [twitter, setTwitter] = useState("");
    const [creatorFee, setCreatorFee] = useState("");
    const [creatorAddress, setCreatorAddress] = useState("");
    const [tokenAddress, setTokenAddress] = useState("");

    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [icon, setIcon] = useState("/img/unknown-icon.png");
    const [website, setWebsite] = useState("");
    const [holders, setHolders] = useState("");
    const [price, setPrice] = useState("");
    const [supply, setSupply] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const handleTokenAddress = (value: any) => {
        setTokenAddress(value);
        setIsInvalid(false);
        if (value.length === 44) {
        }
    }
    const handleKeyDown = (e: any) => {
        setIsLoading(true);
        if (e.key === "Enter") {
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
                        setTwitter(res.twitter);
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
        }
        setIsLoading(false);
    }

    const saveToken = () => {
        if (tokenAddress !== "") {
            addDoc(tokenInstance, {
                address: tokenAddress,
                creatorFee: creatorFee,
                creatorAddress: creatorAddress,
                twitter: twitter,
                createTimeStamp: new Date().getTime(),
                updateTimeStamp: new Date().getTime()
            })
                .then(() => {
                    successAlert("Token has been added!");
                    setTokenAddress("");
                    setCreatorAddress("");
                    setTwitter("");
                    setName("");
                    setSymbol("");
                    setIcon("/img/unknown-icon.png");
                    setWebsite("");
                    setHolders("");
                    setPrice("");
                    setSupply("");
                    onClose();
                    getTokens();
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }

    return (
        <Dialog
            open={opened}
            onClose={() => onClose()}
            maxWidth="sm"
        >
            <div className="token-dialog">
                <div className="token-dialog-header">
                    <h2>{title}</h2>
                    <button className="btn-close" onClick={() => onClose()}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="token-dialog-content">
                    <div className="row">
                        <div className="col-full">
                            <div className="form-control">
                                <label>Token Address</label>
                                <input
                                    value={tokenAddress}
                                    onChange={(e: any) => handleTokenAddress(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Input or paste token address"
                                />
                                {isInvalid &&
                                    <p className="validation-alert">Missing or invalid token Address</p>
                                }
                            </div>
                        </div>
                    </div>
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
                        <div className="col-full">
                            <button className="btn-save" onClick={() => saveToken()}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}