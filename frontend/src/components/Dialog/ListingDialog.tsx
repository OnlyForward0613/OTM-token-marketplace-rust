import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog, FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { TOKEN_ACCOUNT, TOKEN_META } from "../../config";
import { UserTokenType } from "../../contexts/types";
import { getSPLTokensInfo } from "../../contexts/utils";
import { CloseIcon } from "../svgIcons";
import MarketOverviewSkeleton from "../MarketOverviewSkeleton";
import { addDoc, getDocs } from "firebase/firestore";
import { listInstance, tokenInstance } from "../../firebase/marketOperation";
import { successAlert } from "../toastGroup";
import { listToken } from "../../contexts/transaction";
import { PublicKey } from "@solana/web3.js";

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: 300,
        },
    },
};

export default function ListingDialog(props: {
    opened: boolean,
    onClose: Function,
    wallet: WalletContextState,
    updateTable: Function
}) {
    const { opened, onClose, wallet, updateTable } = props;
    const [selectedToken, setSelectedToken] = useState<string>("");
    const [tokenId, setTokenId] = useState("");
    const [userTokens, setUserTokens] = useState<any>();

    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [icon, setIcon] = useState("/img/unknown-icon.png");
    const [website, setWebsite] = useState("");
    const [holders, setHolders] = useState("");
    const [tokenPrice, setTokenPrice] = useState("");
    const [supply, setSupply] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [listPrice, setListPrice] = useState<number | undefined>();
    const [listAmount, setListAmount] = useState<number | undefined>();
    const getUserTokens = async () => {
        const spls = await getSPLTokensInfo(wallet);
        let filteredSpls: any = [];
        if (spls.length !== 0) {
            getDocs(tokenInstance)
                .then((data) => {
                    const tokens = (data.docs.map((item: any) => {
                        return ({ ...item.data(), id: item.id })
                    }));
                    if (tokens.length !== 0) {
                        for (let item of tokens) {
                            for (let spl of spls) {
                                if (item.address === spl.tokenAddress) {
                                    filteredSpls.push({ ...spl, tokenId: item.id })
                                }
                            }
                        }
                    }
                    setUserTokens(filteredSpls)
                }).catch((error) => {
                    console.log(error)
                })
        }
    }
    const handleToken = (event: SelectChangeEvent) => {
        setSelectedToken(event.target.value);
        getTokenDetail(event.target.value);
        for (let item of userTokens) {
            if (item.tokenAddress === event.target.value)
                setTokenId(item.tokenId)
        }
    }
    const handleListAmount = (e: any) => {
        if (e.target.value)
            setListAmount(e.target.value)
    }
    const handleListPrice = (e: any) => {
        if (e.target.value)
            setListPrice(e.target.value)
    }
    const clearField = () => {
        setHolders("");
        setSymbol("");
        setName("");
        setIcon("/img/unknown-icon.png");
        setSupply("");
        setWebsite("");
        setTokenPrice("");
        setListPrice(undefined);
        setListAmount(undefined)
        onClose();
    }

    const getTokenDetail = (tokenAddress: string) => {
        if (selectedToken !== "") {
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
    }

    const dialogUpdate = () => {
        updateTable();
        clearField();
        onClose();
    }
    const handleList = async () => {
        if (!listPrice) return;
        if (!listAmount) return;
        try {
            await listToken(
                wallet,
                new PublicKey(selectedToken),
                listPrice,
                listAmount,
                () => setIsProcessing(true),
                () => setIsProcessing(false),
                () => dialogUpdate()
            )
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (wallet.publicKey !== null) {
            getUserTokens();
            getTokenDetail(selectedToken);
        }
        // eslint-disable-next-line
    }, [wallet.connected, opened, selectedToken])
    return (
        <Dialog
            open={opened}
            onClose={() => clearField()}
            fullWidth
            maxWidth="sm"
        >
            <div className="token-dialog">
                <div className="token-dialog-header">
                    <h2>List your tokens</h2>
                    <button className="btn-close" onClick={() => onClose()}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="token-dialog-content">
                    <div className="row">
                        <div className="col-full">
                            {userTokens && userTokens.length !== 0 ?
                                <FormControl
                                    fullWidth
                                >
                                    <Select
                                        value={selectedToken}
                                        onChange={handleToken}
                                        fullWidth
                                        MenuProps={MenuProps}
                                    >
                                        {
                                            userTokens.map((item: UserTokenType, key: number) => (
                                                <MenuItem value={item.tokenAddress} key={key} >{item.tokenAddress.slice(0, 8)}...{item.tokenAddress.slice(-8)} <span style={{ marginLeft: 8 }}><b>({parseFloat(item.uiAmountString).toLocaleString()})</b></span></MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                                :
                                <p className="empty-tokens">No SPL tokens</p>
                            }
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
                        {selectedToken !== "" &&
                            <>
                                <div className="col-half" style={{ marginTop: 20 }}>
                                    <div className="form-control">
                                        <label>Price Per Token</label>
                                        <input
                                            value={listPrice}
                                            onChange={handleListPrice}
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
                            </>
                        }
                        <div className="col-full">
                            <p className="list-notice">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et tincidunt elit. Curabitur tincidunt rutrum urna id sagittis. Nam blandit nisl quis maximus lacinia. Phasellus non aliquam dolor, eget vehicula mi.
                            </p>
                        </div>
                        {selectedToken !== "" &&
                            <div className="col-full">
                                <button className="btn-save" onClick={() => handleList()} disabled={isProcessing}>
                                    {!isProcessing ? "List tokens" : "Processing..."}
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </Dialog>
    )
}