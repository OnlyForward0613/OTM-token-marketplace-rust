import { useEffect, useState } from "react"
import { TOKEN_META } from "../config";
import { SolanaIcon } from "./svgIcons";
import { Skeleton } from "@mui/material";
import { WalletContextState } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getDocs } from "firebase/firestore";
import { listInstance, salesInstance } from "../firebase/marketOperation";

const DAY_DURATION = 1000 * 3600 * 24;

export default function ListedTableRow(props: {
    tokenAddress: string,
    getTokens: Function,
    icon: string,
    name: string,
    floorPrice: number,
    quantity: number,
    keyword: string,
    wallet: WalletContextState
}) {
    const router = useRouter();
    const { tokenAddress, floorPrice, quantity, wallet, icon, name } = props;
    const [isFetching, setIsFetching] = useState(false);
    const [volumLoading, setVolumLoading] = useState(false);
    const [totalVol, setTotalVol] = useState(0);
    const [floorPercent, setFloorPercent] = useState(0);
    const [todayVolPercent, setTodayVolPercent] = useState(0);
    const [todayTotal, setTodayTotal] = useState(0);

    const getVolData = () => {
        setVolumLoading(true)
        try {
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

                        let total = 0;
                        const now = new Date().getTime();
                        let yesterdayVal = 0;
                        let todayVol = 0;

                        for (let item of tableData) {
                            total = item.price * item.amount;
                            if (now > item.createTimeStamp && item.createTimeStamp > now - DAY_DURATION) {
                                todayVol = item.price * item.amount;
                            }
                            if (now - DAY_DURATION > item.createTimeStamp && item.createTimeStamp > now - 2 * DAY_DURATION) {
                                yesterdayVal = item.price * item.amount;
                            }
                        }
                        let volPercent = 0;
                        if (yesterdayVal !== 0) {
                            volPercent = (todayVol) / yesterdayVal * 100;
                        }
                        setVolumLoading(false);
                        setTodayVolPercent(volPercent);
                        setTodayTotal(todayVol)
                        setTotalVol(total);
                    }
                }).catch((error) => {
                    console.log(error)
                })
            getDocs(listInstance)
                .then(async (data) => {
                    const listed = (data.docs.map((item: any) => {
                        return ({ ...item.data(), id: item.id })
                    }));
                    if (listed.length !== 0) {
                        let result = listed.reduce(function (r: any, a: any) {
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

                        const now = new Date().getTime();
                        let yesterday = [];
                        let today = [];

                        for (let item of tableData) {
                            if (now > item.createTimeStamp && item.createTimeStamp > now - DAY_DURATION) {
                                today.push(item)
                            }
                            if (now - DAY_DURATION > item.createTimeStamp && item.createTimeStamp > now - 2 * DAY_DURATION) {
                                yesterday.push(item)
                            }
                        }
                        const todayFP = Math.min.apply(Math, today.map((o: any) => { return parseFloat(o.price); }));
                        const yesterdayFP = Math.min.apply(Math, yesterday.map((o: any) => { return parseFloat(o.price); }));

                        let fpPercent = 0;
                        if (yesterdayFP !== 0) {
                            fpPercent = (todayFP) / yesterdayFP * 100;
                        }
                        setFloorPercent(fpPercent);
                    }
                }).catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log(error)
            setVolumLoading(false);
        }

    }
    useEffect(() => {
        getVolData();
        // eslint-disable-next-line
    }, [])
    return (
        ((name + tokenAddress + floorPrice + wallet.publicKey?.toBase58()).toLowerCase().indexOf(props.keyword.toLowerCase()) !== -1 ?
            <tr >
                <td>
                    <div className="table-title-cell">
                        {isFetching ?
                            <>
                                <Skeleton variant="circular" width={32} height={32} sx={{ background: "#ffffff2e" }} />
                                <Skeleton variant="rectangular" width={160} height={24} sx={{ background: "#ffffff2e", borderRadius: 1, marginLeft: 1 }} />
                                <Skeleton variant="rectangular" width={60} height={24} sx={{ background: "#ffffff2e", borderRadius: 1, marginLeft: 1 }} />
                            </>
                            :
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
                        }
                    </div>
                </td>
                <td>
                    <div className="price-cell">
                        <div className="price-cell-quantiry">
                            <SolanaIcon />
                            <span>{floorPrice}</span>
                            {
                                <p>{floorPercent.toLocaleString()}%</p>
                            }
                        </div>
                    </div>
                </td>
                <td>
                    <div className="price-cell">
                        <div className="price-cell-quantiry">
                            <SolanaIcon />
                            {
                                <span>{todayTotal.toLocaleString()}</span>
                            }
                        </div>
                        {
                            <p>{todayVolPercent.toLocaleString()}%</p>
                        }
                    </div>
                </td>
                <td>
                    <div className="price-cell">
                        <div className="price-cell-quantiry">
                            <SolanaIcon />
                            {
                                <span>{totalVol.toLocaleString()}</span>
                            }
                        </div>
                    </div>
                </td>
                <td>
                    <div className="price-cell">
                        <div className="price-cell-quantiry">
                            <span>{quantity}</span>
                        </div>
                    </div>
                </td>
                <td align="center">
                    {wallet.publicKey !== null &&
                        <button className="btn-outline" onClick={() => router.push("/token/" + tokenAddress)}>
                            trade
                        </button>
                    }
                </td>
            </tr>
            :
            <>
            </>
        )
    )
}
