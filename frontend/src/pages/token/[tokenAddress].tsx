import { useEffect, useState } from "react";
import Link from "next/link";
import { addDoc, doc, getDocs, updateDoc, collectionGroup, collection, query, onSnapshot, where } from "firebase/firestore";
import { useRouter } from "next/router";
import MarketOverviewSkeleton from "../../components/MarketOverviewSkeleton";
import { TOKEN_ACCOUNT, TOKEN_META } from "../../config";
import { FetchedListItemType } from "../../contexts/types";
import { listInstance, salesInstance, tokenInstance } from "../../firebase/marketOperation";
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import IndeterminateCheckBoxRoundedIcon from '@mui/icons-material/IndeterminateCheckBoxRounded';
import { IconButton } from "@mui/material";
import CachedRoundedIcon from "@mui/icons-material/CachedRounded";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import HashLoader from "react-spinners/HashLoader";
import { db } from "../../firebase/firebaseConfig";
import moment from "moment";
import CopyClipboard from "../../components/CopyClipbord";
import { buy } from "../../contexts/transaction";
import { PublicKey } from "@solana/web3.js";

export default function TokenDetail(props: { startLoading: Function, closeLoading: Function, openDeny: Function, closeDeny: Function }) {
    const router = useRouter();
    const { tokenAddress } = router.query;
    const [tab, setTab] = useState("listings");
    const wallet = useWallet();

    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [icon, setIcon] = useState("/img/unknown-icon.png");
    const [website, setWebsite] = useState("");
    const [holders, setHolders] = useState("");
    const [price, setPrice] = useState("");
    const [supply, setSupply] = useState("");
    const [isTokenLoading, setIsTokenLoading] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isSalesLoading, setIsSalesLoading] = useState(false);
    const [tokenDescription, setTokenDescription] = useState("");

    const [creatorAddress, setCreatorAddress] = useState("");
    const [creatorFee, setCreatorFee] = useState("");
    const [twitter, setTwitter] = useState("");

    const [listedList, setListedList] = useState<any>();
    const [salesHistory, setSalesHistory] = useState<any>();

    const getTokenDetail = () => {
        setIsTokenLoading(true);
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
                    setTokenDescription(res.tag[0]?.description)
                }
                setIsTokenLoading(false);
            })
            .catch((error) => {
                console.log('error', error);
                setIsTokenLoading(false);
            });

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
                setIsTokenLoading(false);
            })
            .catch((error) => {
                console.log('error', error);
                setIsTokenLoading(false);
            });
    }

    const getListingData = () => {
        if (wallet.publicKey === null) return;
        setIsFetching(true)
        let filtered: any = [];
        getDocs(listInstance)
            .then(async (data) => {
                const lists = (data.docs.map((item: any) => {
                    return ({ ...item.data(), id: item.id })
                }));
                if (lists.length !== 0) {
                    let result = lists.reduce(function (r: any, a: any) {
                        r[a.tokenAddress] = r[a.tokenAddress] || [];
                        r[a.tokenAddress].push(a);
                        return r;
                    }, Object.create(null));
                    for (let item of Object.keys(result)) {
                        if (item === tokenAddress) {
                            let listData = result[item];
                            for (let item of listData) {
                                if (item.amount !== 0) {
                                    filtered.push(item)
                                }
                            }
                            filtered.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
                            setListedList(filtered)
                        }
                    }
                }
            }).catch((error) => {
                console.log(error)
                setIsFetching(false)
            })
        getDocs(tokenInstance)
            .then(async (data) => {
                const tokens = (data.docs.map((item: any) => {
                    return ({ ...item.data(), id: item.id })
                }));
                for (let item of tokens) {
                    if (item.address === tokenAddress) {
                        setCreatorAddress(item.creatorAddress === "" ? wallet.publicKey?.toBase58() : item.creatorAddress);
                        setCreatorFee(item.creatorFee === "" ? 0 : item.creatorFee);
                        setTwitter(item.twitter);
                    }
                }
                setIsFetching(false);
            }).catch((error) => {
                console.log(error)
                setIsFetching(false)
            })
    }

    const getSalesData = async () => {
        setSalesHistory([]);
        setIsSalesLoading(true);
        getDocs(salesInstance)
            .then(async (data) => {
                const sales = (data.docs.map((item: any) => {
                    return ({ ...item.data(), id: item.id })
                }));
                if (sales.length !== 0) {
                    let result = sales.reduce(function (r: any, a: any) {
                        r[a.tokenAddress] = r[a.tokenAddress] || [];
                        r[a.tokenAddress].push(a);
                        return r;
                    }, Object.create(null));
                    let tableData: any = [];
                    for (let item of Object.keys(result)) {
                        if (item === tokenAddress) {
                            tableData = result[item]
                        }
                    }
                    tableData.sort((a: any, b: any) => b.createTimeStamp - a.createTimeStamp);
                    setSalesHistory(tableData)
                }
                setIsSalesLoading(false);
            }).catch((error) => {
                setIsSalesLoading(false);
                console.log(error)
            })
    }

    const updatePage = () => {
        getListingData();
        getSalesData();
    }

    useEffect(() => {
        if (tokenAddress && wallet.publicKey !== null) {
            getTokenDetail();
            updatePage();
        }
        // eslint-disable-next-line
    }, [wallet.connected, router])

    useEffect(() => {
        const collectionRefToken = collection(db, "tokens");
        const qToken = query(collectionRefToken);
        const collectionRefListings = collection(db, "listings");
        const qListings = query(collectionRefListings);
        const collectionRefSales = collection(db, "sales");
        const qSales = query(collectionRefSales);
        onSnapshot(qToken, () => {
            updatePage();
        });
        onSnapshot(qListings, () => {
            updatePage();
        });
        onSnapshot(qSales, () => {
            updatePage();
        });
        return;
        // eslint-disable-next-line
    }, [])

    return (
        <main className="main-page" style={{ paddingTop: 150 }}>
            <div className="container-1">
                <div className="detail-page">
                    <h1 className="text-2">{tokenAddress}</h1>
                    {isTokenLoading ?
                        <MarketOverviewSkeleton tokenPage />
                        :
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
                                <label className="title">Description</label>
                                <p className="value">{tokenDescription}</p>
                            </div>
                            <div className="overview-item">
                                <label className="title">Website</label>
                                {website !== "" &&
                                    <Link href={website}>
                                        <a target="_blank">
                                            {website}
                                        </a>
                                    </Link>
                                }
                            </div>
                            <div className="overview-item">
                                <label className="title">Twitter</label>
                                {twitter !== "" &&
                                    <Link href={twitter}>
                                        <a target="_blank">
                                            {twitter}
                                        </a>
                                    </Link>
                                }
                            </div>
                        </div>
                    }
                    <div className="detail-table">
                        <div className="page-tab">
                            <button className={tab === "listings" ? "active" : ""} onClick={() => setTab("listings")}>Listings</button>
                            <button className={tab === "sales" ? "active" : ""} onClick={() => setTab("sales")}>Sales</button>
                        </div>
                        {tab === "listings" &&
                            <div className="table-container">
                                <span className="data-refresh">
                                    <IconButton onClick={() => getListingData()} className={isFetching ? "spin" : ""}>
                                        <CachedRoundedIcon fontSize="large" sx={{ fill: "#00f0ff" }} />
                                    </IconButton>
                                </span>
                                <table className="listed-table">
                                    <thead>
                                        <tr>
                                            <th align="left">Price</th>
                                            <th align="left">Quantity</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listedList && listedList.length !== 0 && listedList.map((item: FetchedListItemType, key: number) => (
                                            <tr key={key}>
                                                <td>{item.price}◎</td>
                                                <td>{item.amount}</td>
                                                <td>
                                                    {item.userAddress !== wallet.publicKey?.toBase58() &&
                                                        <BuyCellItem
                                                            qty={parseFloat(item.amount)}
                                                            pda={item.pda}
                                                            wallet={wallet}
                                                            creator={creatorAddress}
                                                            fee={creatorFee}
                                                            updateData={() => updatePage()}
                                                            listId={item.id}
                                                            tokenAddress={tokenAddress}
                                                            price={parseFloat(item.price)}
                                                            creatorFee={creatorFee}
                                                            startLoading={() => props.startLoading()}
                                                            closeLoading={() => props.closeLoading()}
                                                            openDeny={() => props.openDeny()}
                                                            closeDeny={() => props.closeDeny()}
                                                        />
                                                    }
                                                </td>
                                                <td align="right">
                                                    {item.userAddress === wallet.publicKey?.toBase58() && <span className="your-own">Your own listing</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }
                        {tab === "sales" &&
                            <div className="table-container">
                                <span className="data-refresh">
                                    <IconButton onClick={() => getSalesData()} className={isSalesLoading ? "spin" : ""}>
                                        <CachedRoundedIcon fontSize="large" sx={{ fill: "#00f0ff" }} />
                                    </IconButton>
                                </span>
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th align="left">Time</th>
                                            <th align="left">Transaction</th>
                                            <th align="left">Buyer</th>
                                            <th align="left">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesHistory && salesHistory.length !== 0 && salesHistory.map((item: FetchedListItemType, key: number) => (
                                            <tr key={key}>
                                                <td align="left">
                                                    <span title={moment(item.createTimeStamp).format()}>
                                                        {moment(item.createTimeStamp).fromNow()}
                                                    </span>
                                                </td>
                                                <td align="left">
                                                    <CopyClipboard text={item.tx}>
                                                        {item.tx.slice(0, 6)}...{item.tx.slice(-6)}
                                                    </CopyClipboard>
                                                </td>
                                                <td align="left">
                                                    <CopyClipboard text={item.userAddress}>
                                                        {item.userAddress.slice(0, 4)}...{item.userAddress.slice(-4)}
                                                    </CopyClipboard>
                                                </td>
                                                <td align="left">{item.amount}◎{item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </main>
    )
}

export function BuyCellItem(props: {
    qty: number,
    pda: string,
    wallet: WalletContextState,
    creator: string,
    fee: string,
    listId: string,
    updateData: Function,
    tokenAddress: any,
    price: number,
    creatorFee: string,
    startLoading: Function,
    closeLoading: Function,
    openDeny: Function,
    closeDeny: Function
}) {

    const { qty, pda, wallet, tokenAddress, creator, fee, updateData, listId, price, creatorFee, startLoading, closeLoading } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState(1)
    const handleAmount = (e: any) => {
        setAmount(e.target.value)
    }
    const handleInc = () => {
        if (amount < qty) {
            const value = amount;
            setAmount(value + 1);
        }
    }
    const handleDec = () => {
        if (amount > 1) {
            const value = amount;
            setAmount(value - 1);
        }
    }

    const startHandle = () => {
        setIsLoading(true);
        props.openDeny();
    }

    const closeHandle = () => {
        setIsLoading(false);
        props.closeDeny();
    }

    const buyTokens = async () => {
        try {
            await buy(
                wallet,
                new PublicKey(pda),
                new PublicKey(creator),
                parseFloat(creatorFee),
                amount,
                tokenAddress,
                price,
                listId,
                qty,
                () => startHandle(),
                () => closeHandle(),
                () => updateData()
            )
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className="buy-cell-control">
            <IconButton onClick={() => handleDec()}>
                <IndeterminateCheckBoxRoundedIcon />
            </IconButton>
            <input
                value={amount}
                onChange={handleAmount}
            />
            <IconButton onClick={() => handleInc()}>
                <AddBoxRoundedIcon />
            </IconButton>
            <button className="max" onClick={() => setAmount(qty)}>max</button>
            <button className="buy" onClick={() => buyTokens()} disabled={isLoading}>
                {isLoading ?
                    <HashLoader size={16} color="#000" />
                    :
                    <>Buy</>
                }
            </button>
        </div>
    )
}