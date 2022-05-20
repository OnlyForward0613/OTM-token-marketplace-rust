import { useState } from "react";

export default function TokenSearch(props: { onKeyword?: Function }) {
    const [inputValue, setInputValue] = useState("");
    const handleChange = (value: string) => {
        setInputValue(value);
        if (props.onKeyword)
            props.onKeyword(value);
    }
    return (
        <input
            className="token-searchbox"
            value={inputValue}
            onChange={(e: any) => handleChange(e.target.value)}
            placeholder="Search tokens"
        />
    );
}

export interface TokenOptionItem {
    name: string;
    symbol: string;
    address: string;
    icon: string;
}