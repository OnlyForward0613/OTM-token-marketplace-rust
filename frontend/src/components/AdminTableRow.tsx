import Link from "next/link";
import { useEffect, useState } from "react"
import { TOKEN_META } from "../config";
import { TrashIcon, TwitterLineIcon } from "./svgIcons";
import TokenEditDialog from "./Dialog/TokenEditDialog";
import { Skeleton } from "@mui/material";
import { deleteDoc, doc } from "firebase/firestore";
import { database } from "../firebase/firebaseConfig";
import { successAlert } from "./toastGroup";
import CopyClipboard from "./CopyClipbord";

export default function AdminTableRow(props: {
    tokenAddress: string,
    id: string,
    creatorFee: string,
    creatorAddress: string,
    twitter: string,
    getTokens: Function,
    keyword: string
}) {
    const { tokenAddress, id, getTokens, creatorAddress, creatorFee } = props;
    const [icon, setIcon] = useState("");
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [twitter, setTwitter] = useState(props.twitter);
    const [editDialog, setEditDialog] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const getTokenDetail = () => {
        setIsFetching(true);
        fetch(TOKEN_META + tokenAddress)
            .then(response => response.text())
            .then(result => {
                const res = JSON.parse(result);
                if (res.address) {
                    setSymbol(res.symbol);
                    setName(res.name);
                    setIcon(res.icon);
                    setTwitter(res.twitter);
                }
                setIsFetching(false);
            })
            .catch((error) => {
                console.log('error', error);
                setIsFetching(false);
            });
    }
    const deleteToken = () => {
        const collectionById = doc(database, 'tokens', id)
        deleteDoc(collectionById)
            .then(() => {
                successAlert("Remove success!");
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
        ((name + " - " + symbol + twitter + tokenAddress + creatorAddress).toLowerCase().indexOf(props.keyword.toLowerCase()) !== -1 ?
            <tr>
                <td>
                    <div className="table-title-cell">
                        {isFetching ?
                            <>
                                <Skeleton variant="circular" width={32} height={32} sx={{ background: "#ffffff2e" }} />
                                <Skeleton variant="rectangular" width={160} height={24} sx={{ background: "#ffffff2e", borderRadius: 1, marginLeft: 1 }} />
                                <Skeleton variant="rectangular" width={60} height={24} sx={{ background: "#ffffff2e", borderRadius: 1, marginLeft: 1 }} />
                            </>
                            :
                            <>
                                {/* eslint-disable-next-line */}
                                <img
                                    src={icon ? icon : "/img/unknown-icon.png"}
                                    alt=""
                                />
                                <h5>{symbol ? name + "-" + symbol : "Unknown Token"} </h5>
                            </>
                        }
                    </div>
                </td>
                <td align="center">
                    <div className="price-cell display-center">
                        <div className="price-cell-quantiry">
                            <CopyClipboard text={tokenAddress}>
                                <span>
                                    {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-6)}
                                </span>
                            </CopyClipboard>
                        </div>
                    </div>
                </td>
                <td align="center">
                    <div className="price-cell display-center">
                        <div className="price-cell-quantiry">
                            {creatorAddress === "" ?
                                <span>--</span> :
                                <span>{creatorAddress.slice(0, 5)}...{creatorAddress.slice(-5)}</span>
                            }
                        </div>
                    </div>
                </td>
                <td align="center">
                    <div className="price-cell display-center">
                        <div className="price-cell-quantiry">
                            {creatorFee === "" ?
                                <span>--</span> :
                                <span>{creatorFee}</span>
                            }
                        </div>
                    </div>
                </td>
                <td align="center">
                    <div className="price-cell display-center">
                        <div className="price-cell-quantiry">
                            {twitter !== "" &&
                                <Link href={twitter}>
                                    <a target="_blank">
                                        <TwitterLineIcon />
                                    </a>
                                </Link>
                            }
                        </div>
                    </div>
                </td>
                <td align="center">
                    <div className="cell-control">
                        <button className="btn-outline" onClick={() => setEditDialog(true)}>
                            Edit
                        </button>
                        <button className="btn-outline btn-remove" onClick={() => deleteToken()}>
                            <TrashIcon />
                        </button>
                        <TokenEditDialog
                            opened={editDialog}
                            title="Edit Token"
                            onClose={() => setEditDialog(false)}
                            tokenId={id}
                            tokenAddress={tokenAddress}
                            creatorAddress={creatorAddress}
                            creatorFee={creatorFee}
                            twitter={twitter}
                            getTokens={() => getTokens()}
                        />
                    </div>
                </td>
            </tr >
            :
            <>
            </>
        )
    )
}
