import { useEffect, useState } from "react"
import { FormControl, IconButton, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import { TOKEN_META } from "../config";
import TokenSearch from "./TokenSearch";
import { useWallet } from "@solana/wallet-adapter-react";
import ListingDialog from "./Dialog/ListingDialog";
import HashLoader from "react-spinners/HashLoader";
import CachedRoundedIcon from "@mui/icons-material/CachedRounded";
import { listInstance, salesInstance } from "../firebase/marketOperation";
import { getDocs } from "firebase/firestore";
import { ListedTokenType } from "../contexts/types";
import ListedTableRow from "./ListedTableRow";
import MyListingRow from "./MyListingRow";
import SalesHistoryRow from "./SalesHistoryRow";

export default function ListedTokenTable(props: { startLoading: Function, closeLoading: Function }) {
  const wallet = useWallet();
  const [listing, setListing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [sort, setSort] = useState("price-low");
  const [showList, setShowList] = useState<any>();
  const [keyword, setKeyword] = useState("");

  const [myListingLoading, setMyListingLoading] = useState(false);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [mySalesLoading, setMySalesLoading] = useState(false);
  const [myListed, setMyListed] = useState<any>([]);
  const [mySales, setMySales] = useState<any>([]);
  const [salesList, setSalesList] = useState<any>([]);
  const [salesLoading, setSalesLoading] = useState(false);

  const [tab, setTab] = useState("all");

  const handleTab = (tabName: string, update: Function) => {
    setTab(tabName);
    update();
  }

  const handleSort = (event: SelectChangeEvent) => {
    setSort(event.target.value);
  };
  const getListedTokens = () => {
    setIsFetching(true)
    getDocs(listInstance)
      .then(async (data) => {
        const tokens = (data.docs.map((item: any) => {
          return ({ ...item.data(), id: item.id })
        }));
        if (tokens.length !== 0) {
          let result = tokens.reduce(function (r: any, a: any) {
            r[a.tokenAddress] = r[a.tokenAddress] || [];
            r[a.tokenAddress].push(a);
            return r;
          }, Object.create(null));
          let tableData: any = [];
          for (let item of Object.keys(result)) {
            const min = Math.min.apply(Math, result[item].map((o: any) => { return parseFloat(o.price); }))
            let qty = 0;
            for (let subItem of result[item]) {
              qty += parseFloat(subItem.amount)
            }
            let name = "";
            let icon = "";
            await fetch(TOKEN_META + item)
              .then(response => response.text())
              .then(resData => {
                const res = JSON.parse(resData);
                if (res.name) {
                  name = res.name + " - " + res.symbol;
                } else {
                  name = "Unknown Token"
                }
                icon = res.icon;
                tableData.push({
                  tokenAddress: item,
                  icon: icon,
                  name: name,
                  floorPrice: min,
                  quantity: qty
                })
              })
              .catch((error) => {
                console.log('error', error);
                setIsFetching(false);
              });

          }
          filterTableData(tableData)
        }
        setIsFetching(false);
      }).catch((error) => {
        console.log(error)
        setIsFetching(false)
      })
  }

  const getMyListings = () => {
    if (wallet.publicKey === null) return;
    setMyListingLoading(true);

    getDocs(listInstance)
      .then(async (data) => {
        const listings = (data.docs.map((item: any) => {
          return ({ ...item.data(), id: item.id })
        }));
        if (listings.length !== 0) {
          let tableData: any = [];
          for (let item of listings) {
            if (item.userAddress === wallet.publicKey?.toBase58()) {
              let name = "";
              let icon = "";
              await fetch(TOKEN_META + item.tokenAddress)
                .then(response => response.text())
                .then(resData => {
                  const res = JSON.parse(resData);
                  if (res.name) {
                    name = res.name + " - " + res.symbol;
                  } else {
                    name = "Unknown Token"
                  }
                  icon = res.icon;
                  tableData.push({
                    tokenAddress: item.tokenAddress,
                    icon: icon,
                    name: name,
                    tx: item.tx,
                    id: item.id,
                    quantity: item.amount,
                    price: item.price,
                    pda: item.pda
                  })
                })
                .catch((error) => {
                  console.log('error', error);
                  setIsFetching(false);
                });
            }

          }
          tableData.sort((a: any, b: any) => b.createTimeStamp - a.createTimeStamp)
          sortTableList(tableData, setMyListed)
        }
        setMyListingLoading(false);
      }).catch((error) => {
        console.log(error)
        setMyListingLoading(false);
      })

  }

  const getSalesHistory = () => {
    setSalesLoading(true);
    getDocs(salesInstance)
      .then(async (data) => {
        const sales = (data.docs.map((item: any) => {
          return ({ ...item.data(), id: item.id })
        }));
        if (sales.length !== 0) {
          let tableData: any = [];
          let myTableData: any = [];
          let name = "";
          let icon = "";
          for (let item of sales) {
            await fetch(TOKEN_META + item.tokenAddress)
              .then(response => response.text())
              .then(resData => {
                const res = JSON.parse(resData);
                if (res.name) {
                  name = res.name + " - " + res.symbol;
                } else {
                  name = "Unknown Token"
                }
                icon = res.icon;
                tableData.push({
                  tokenAddress: item.tokenAddress,
                  icon: icon,
                  name: name,
                  tx: item.tx,
                  time: item.createTimeStamp,
                  quantity: item.amount,
                  price: item.price,
                  buyer: item.userAddress
                })
                if (item.userAddress === wallet.publicKey?.toBase58()) {
                  myTableData.push({
                    tokenAddress: item.tokenAddress,
                    icon: icon,
                    name: name,
                    tx: item.tx,
                    time: item.createTimeStamp,
                    quantity: item.amount,
                    price: item.price,
                    buyer: item.userAddress
                  })
                }
              })
              .catch((error) => {
                console.log('error', error);
                setIsFetching(false);
              });
          }
          tableData.sort((a: any, b: any) => a.createTimeStamp - b.createTimeStamp);
          sortTableList(tableData, setSalesList);
          sortTableList(myTableData, setMySales);
        }
        setSalesLoading(false);
      }).catch((error) => {
        console.log(error)
        setSalesLoading(false);
      })
  }

  const filterTableData = (tableData: any) => {
    if (tableData && tableData.length !== 0) {
      if (sort === "price-low") tableData.sort((a: any, b: any) => b.floorPrice - a.floorPrice);
      if (sort === "price-high") tableData.sort((a: any, b: any) => a.floorPrice - b.floorPrice);
      if (sort === "a-z") tableData.sort((a: any, b: any) => a.name.localeCompare(b.name));
      if (sort === "z-a") tableData.sort((a: any, b: any) => b.name.localeCompare(a.name));
    }
    setShowList(tableData);
  }

  const sortTableList = (tableData: any, setData: Function) => {
    if (tableData && tableData.length !== 0) {
      if (sort === "price-low") tableData.sort((a: any, b: any) => b.price - a.price);
      if (sort === "price-high") tableData.sort((a: any, b: any) => a.price - b.price);
      if (sort === "a-z") tableData.sort((a: any, b: any) => a.name.localeCompare(b.name));
      if (sort === "z-a") tableData.sort((a: any, b: any) => b.name.localeCompare(a.name));
    }
    setData(tableData);
  }

  useEffect(() => {
    getListedTokens();
    getMyListings();
    getSalesHistory();
    // eslint-disable-next-line
  }, [wallet.connected, sort])

  return (
    <div className="tokens-box" id="listed-tokens">
      <div className="tokens-box-action">
        {wallet.publicKey !== null ?
          <button className="btn-primary" onClick={() => setListing(true)}>List/Sell Tokens</button>
          :
          <div></div>

        }
        <div className="table-filter">
          <div className="filter-item">
            <label>sort by</label>
            <FormControl>
              <Select
                value={sort}
                onChange={handleSort}
                defaultValue="hot"
                sx={{ width: 200 }}
              >
                <MenuItem value={"price-low"}><div className="display-left">Floor Price <ArrowDownwardRoundedIcon sx={{ fontSize: 20 }} /></div></MenuItem>
                <MenuItem value={"price-high"}><div className="display-left">Floor Price <ArrowUpwardRoundedIcon sx={{ fontSize: 20 }} /></div></MenuItem>
                <MenuItem value={"a-z"}>A-Z</MenuItem>
                <MenuItem value={"z-a"}>Z-A</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="filter-item">
            <label>search</label>
            <TokenSearch onKeyword={(e: any) => setKeyword(e)} />
          </div>
        </div>
      </div>
      <div className="listed-table-action">
        <div className="page-tab">
          <button className={tab === "all" ? "active" : ""} onClick={() => handleTab("all", () => getListedTokens())}>All Listings</button>
          {wallet.publicKey !== null &&
            <button className={tab === "my-listing" ? "active" : ""} onClick={() => handleTab("my-listing", () => getMyListings())}>My Listings</button>
          }
          <button className={tab === "sales-history" ? "active" : ""} onClick={() => handleTab("sales-history", () => getSalesHistory())}>Sales History</button>
          {wallet.publicKey !== null &&
            <button className={tab === "my-sales-history" ? "active" : ""} onClick={() => handleTab("my-sales-history", () => getSalesHistory())}>My Sales History</button>
          }
        </div>
      </div>
      {tab === "all" &&
        <table className="tokens-table">
          <thead>
            <tr>
              <th align="left">Tokens</th>
              <th align="left">Floor</th>
              <th align="left">24h Vol</th>
              <th align="left">Total Vol</th>
              <th align="left">Quantity</th>
              <th align="center" style={{ width: 160 }}>
                <span>
                  <IconButton onClick={() => getListedTokens()} className={isFetching ? "spin" : ""}>
                    <CachedRoundedIcon fontSize="large" sx={{ fill: "#00f0ff" }} />
                  </IconButton>
                </span>
              </th>
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
              showList && showList.length !== 0 && showList.map((item: ListedTokenType, key: number) => (
                <ListedTableRow
                  key={key}
                  tokenAddress={item.tokenAddress}
                  getTokens={() => getListedTokens()}
                  floorPrice={item.floorPrice}
                  icon={item.icon}
                  name={item.name}
                  keyword={keyword}
                  quantity={item.quantity}
                  wallet={wallet}
                />
              ))}
          </tbody>
        </table>
      }
      {wallet.publicKey !== null && tab === "my-listing" &&
        <div className="history-table table-container">
          <h3>My Listings</h3>
          <table className="listed-table">
            <thead>
              <tr>
                <th align="left">Name</th>
                <th align="left">Address</th>
                <th align="left">QTY</th>
                <th align="left">Price</th>
                <th align="center" style={{ width: 180 }}>
                  <span>
                    <IconButton onClick={() => getMyListings()} className={myListingLoading ? "spin" : ""}>
                      <CachedRoundedIcon fontSize="large" sx={{ fill: "#00f0ff" }} />
                    </IconButton>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {myListingLoading ?
                <tr>
                  <td colSpan={5} align="center" style={{ padding: "180px 0", borderBottom: "none" }}>
                    <HashLoader size={32} color="#00f0f7" />
                  </td>
                </tr>
                :
                myListed && myListed.length !== 0 && myListed.map((item: any, key: number) => (
                  <MyListingRow
                    key={key}
                    tokenAddress={item.tokenAddress}
                    listedId={item.id}
                    getLists={() => getMyListings()}
                    icon={item.icon}
                    name={item.name}
                    tx={item.tx}
                    price={item.price}
                    quantity={item.quantity}
                    keyword={keyword}
                    wallet={wallet}
                    pda={item.pda}
                    startLoading={() => props.startLoading()}
                    closeLoading={() => props.closeLoading()}
                  />
                ))}
            </tbody>
          </table>
        </div>
      }
      {tab === "sales-history" &&
        <div className="history-table table-container">
          <h3>Sales History</h3>
          <span className="table-refresh">
            <IconButton onClick={() => getSalesHistory()} className={salesLoading ? "spin" : ""}>
              <CachedRoundedIcon fontSize="large" sx={{ fill: "#00f0ff" }} />
            </IconButton>
          </span>
          <table className="listed-table">
            <thead>
              <tr>
                <th align="left">Token</th>
                <th align="left">Transaction</th>
                <th align="left">Time</th>
                <th align="left">Buyer</th>
                <th align="left">Price</th>
              </tr>
            </thead>
            <tbody>
              {salesLoading ?
                <tr>
                  <td colSpan={6} align="center" style={{ padding: "180px 0", borderBottom: "none" }}>
                    <HashLoader size={32} color="#00f0f7" />
                  </td>
                </tr>
                :
                salesList && salesList.length !== 0 && salesList.map((item: any, key: number) => (
                  <SalesHistoryRow
                    key={key}
                    tokenAddress={item.tokenAddress}
                    getLists={() => getSalesHistory()}
                    icon={item.icon}
                    name={item.name}
                    tx={item.tx}
                    buyer={item.buyer}
                    createTimeStamp={item.time}
                    price={item.price}
                    quantity={item.quantity}
                    keyword={keyword}
                    wallet={wallet}
                  />
                ))}
            </tbody>
          </table>
        </div>
      }
      {wallet.publicKey !== null && tab === "my-sales-history" &&
        <div className="history-table table-container">
          <h3>Sales History</h3>
          <span className="table-refresh">
            <IconButton onClick={() => getSalesHistory()} className={salesLoading ? "spin" : ""}>
              <CachedRoundedIcon fontSize="large" sx={{ fill: "#00f0ff" }} />
            </IconButton>
          </span>
          <table className="listed-table">
            <thead>
              <tr>
                <th align="left">Token</th>
                <th align="left">Transaction</th>
                <th align="left">Time</th>
                <th align="left">Price</th>
              </tr>
            </thead>
            <tbody>
              {salesLoading ?
                <tr>
                  <td colSpan={6} align="center" style={{ padding: "180px 0", borderBottom: "none" }}>
                    <HashLoader size={32} color="#00f0f7" />
                  </td>
                </tr>
                :
                mySales && mySales.length !== 0 && mySales.map((item: any, key: number) => (
                  <SalesHistoryRow
                    key={key}
                    tokenAddress={item.tokenAddress}
                    getLists={() => getSalesHistory()}
                    icon={item.icon}
                    name={item.name}
                    tx={item.tx}
                    buyer={item.buyer}
                    createTimeStamp={item.time}
                    price={item.price}
                    quantity={item.quantity}
                    keyword={keyword}
                    wallet={wallet}
                    isMine={true}
                  />
                ))}
            </tbody>
          </table>
        </div>
      }
      {/* <div className="load-more-box">
                <button>Load More</button>
            </div> */}
      <ListingDialog
        opened={listing}
        onClose={() => setListing(false)}
        updateTable={() => getListedTokens()}
        wallet={wallet}
      />
    </div>
  )
}
