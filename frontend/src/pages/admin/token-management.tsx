import { useEffect, useState } from "react";
import { FormControl, MenuItem, Select, SelectChangeEvent, IconButton } from "@mui/material";
import { AddIcon } from "../../components/svgIcons";
import TokenSearch from "../../components/TokenSearch";
import TokenDialog from "../../components/Dialog/TokenDialog";
import { tokenInstance } from "../../firebase/marketOperation";
import { getDocs } from "firebase/firestore";
import AdminTableRow from "../../components/AdminTableRow";
import CachedRoundedIcon from "@mui/icons-material/CachedRounded";
import HashLoader from "react-spinners/HashLoader";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";

export default function TokenManagement() {

    const [sort, setSort] = useState("recent");
    const [dialog, setDialog] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [tokenList, setTokenList] = useState<any>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [keyword, setKeyword] = useState("");

    const handleDialog = (title: string) => {
        setDialog(true);
        setDialogTitle(title);
    }

    const getTokens = () => {
        setTokenList([]);
        setIsFetching(true);
        getDocs(tokenInstance)
            .then((data) => {
                const tokens = (data.docs.map((item) => {
                    return ({ ...item.data(), id: item.id })
                }));
                if (tokens.length !== 0) {
                    fitlerList(tokens)
                }
                setIsFetching(false);
            }).catch((error) => {
                console.log(error)
                setIsFetching(false)
            })
    }

    const fitlerList = (tokens: any) => {
        if (tokens && tokens.length !== 0) {
            if (sort === "recent") tokens.sort((a: any, b: any) => b.createTimeStamp - a.createTimeStamp);
            if (sort === "oldest") tokens.sort((a: any, b: any) => a.createTimeStamp - b.createTimeStamp);
            if (sort === "fee-low") tokens.sort((a: any, b: any) => parseFloat(b.creatorFee) - parseFloat(a.creatorFee));
            if (sort === "fee-high") tokens.sort((a: any, b: any) => parseFloat(a.creatorFee) - parseFloat(b.creatorFee));
            setTokenList(tokens);
        }
    }

    const handleSort = (event: SelectChangeEvent) => {
        setSort(event.target.value);
    };

    const handleKeyword = (e: string) => {
        setKeyword(e)
    }
    useEffect(() => {
        getTokens();
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        getTokens();
        // eslint-disable-next-line
    }, [sort])

    return (
        <main className="main-page">
            <div className="container">
                <h1>
                    <span>Whitelist Tokens</span>
                    <span>
                        <IconButton onClick={() => getTokens()} className={isFetching ? "spin" : ""}>
                            <CachedRoundedIcon fontSize="large" sx={{ fill: "#00f0ff" }} />
                        </IconButton>
                    </span>
                </h1>
                <div className="tokens-box-action">
                    <button className="btn-primary" onClick={() => handleDialog("Add Token")}>
                        <div className="display-center">
                            <AddIcon /> add token
                        </div>
                    </button>
                    <div className="table-filter">
                        <div className="filter-item">
                            <label>sort by</label>
                            <FormControl>
                                <Select
                                    value={sort}
                                    onChange={handleSort}
                                    defaultValue="recent"
                                    sx={{ width: 200 }}
                                >
                                    <MenuItem value={"recent"}>Recent</MenuItem>
                                    <MenuItem value={"oldest"}>Oldest</MenuItem>
                                    <MenuItem value={"fee-low"}><div className="display-left">Creator Fee <ArrowDownwardRoundedIcon /></div></MenuItem>
                                    <MenuItem value={"fee-high"}><div className="display-left">Creator Fee <ArrowUpwardRoundedIcon /></div></MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="filter-item">
                            <label>search</label>
                            <TokenSearch onKeyword={(e: string) => handleKeyword(e)} />
                        </div>
                    </div>
                </div>
                <table className="tokens-table">
                    <thead>
                        <tr>
                            <th align="left">Tokens</th>
                            <th align="left">Address</th>
                            <th align="center">Creator</th>
                            <th align="center">Fee(%)</th>
                            <th align="center">Social</th>
                            <th align="center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isFetching ?
                            <tr>
                                <td colSpan={5} align="center" style={{ padding: "180px 0", borderBottom: "none" }}>
                                    <HashLoader size={32} color="#00f0f7" />
                                </td>
                            </tr>
                            :
                            tokenList && tokenList.length !== 0 && tokenList.map((item: any, key: number) => (
                                <AdminTableRow
                                    tokenAddress={item.address}
                                    key={key}
                                    id={item.id}
                                    keyword={keyword}
                                    creatorAddress={item.creatorAddress}
                                    creatorFee={item.creatorFee}
                                    twitter={item.twitter}
                                    getTokens={() => getTokens()}
                                />
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <TokenDialog opened={dialog} onClose={() => setDialog(false)} title={dialogTitle} getTokens={() => getTokens()} />
        </main>
    )
}
