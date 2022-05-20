import copy from "copy-to-clipboard";
import { useState } from "react";
import { PastIcon } from "./svgIcons";

export default function CopyClipboard(props: { children: any, text: string }) {

    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        copy(props.text);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }
    return (
        <span className="copyable-tag" onClick={() => handleCopy()}>
            {props.children}
            <span className="copy-icon">
                {!isCopied ?
                    <PastIcon /> :
                    <span className="copied">copied!</span>
                }
            </span>
        </span>
    )
}