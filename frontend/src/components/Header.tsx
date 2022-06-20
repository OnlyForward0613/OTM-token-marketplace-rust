import { useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminValidation, solConnection } from "../contexts/utils";
import { CloseIcon, DiscordIcon, MenuIcon, TwitterIcon } from "./svgIcons";

export default function Header(props: { deny: boolean }) {
    const wallet = useWallet();
    const [open, setOpen] = useState(false);
    const [solBalance, setSolBalance] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const getUserBalance = async () => {
        if (wallet.publicKey === null) return;
        const balance = await solConnection.getBalance(wallet.publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);
    }
    useEffect(() => {
        if (wallet.publicKey !== null) {
            getUserBalance()
            setIsAdmin(adminValidation(wallet))
        } else {
            setIsAdmin(false);
        }
        // eslint-disable-next-line
    }, [wallet.connected])
    return (
        <>
            {/* {props.deny &&
                <div className="deni-notice">
                    <p>Never reload a page while a transaction is in progress. Transactions may fail, or unexpected errors may occur.</p>
                </div>
            } */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <Link href="/">
                                <a>
                                    {/* eslint-disable-next-line */}
                                    <img
                                        src="/img/logo-text.png"
                                        alt="logo"
                                    />
                                </a>
                            </Link>
                        </div>
                        <div className="header-center">
                            <nav className="header-nav">
                                <ul>
                                    <li>
                                        <Link href="/">
                                            <a><DiscordIcon /></a>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/">
                                            <a className="header-logo">
                                                {/* eslint-disable-next-line */}
                                                <img
                                                    src="/img/logo.png"
                                                    alt="logo"
                                                />
                                            </a>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/">
                                            <a><TwitterIcon /></a>
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <div className="header-right">
                            {wallet.publicKey !== null && !isAdmin &&
                                <div className="user-balance">
                                    <span>{solBalance.toLocaleString()} <span className="display-sol">SOL</span><span className="mobile-sol">◎</span></span>
                                </div>
                            }
                            {isAdmin &&
                                <Link href="/admin/token-management">
                                    <a>
                                        <button className="btn-third">Manage Tokens</button>
                                    </a>
                                </Link>
                            }
                            <WalletModalProvider>
                                <WalletMultiButton />
                            </WalletModalProvider>
                            <div className="mobile-menu">
                                <button onClick={() => setOpen(!open)}>
                                    {open ?
                                        <CloseIcon color="#fff" />
                                        :
                                        <MenuIcon color="#fff" />
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                    {open &&
                        <nav className="mobile-nav" onClick={() => setOpen(false)}>
                            <ul>
                                <li>
                                    <Link href="https://twitter.com/eternalunft?s=21&t=Mgwl1SHcuvfJnt1CSSii5g">
                                        <a className="social-link">
                                            <TwitterIcon />
                                        </a>
                                    </Link>
                                    <Link href="https://discord.gg/Ur4DFDMj">
                                        <a className="social-link">
                                            <DiscordIcon />
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <a>Home</a>
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    }
                </div>
            </header>
        </>
    )
}