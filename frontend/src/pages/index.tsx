import ListedTokenTable from "../components/ListedTokenTable";
import HeroBanner from "../components/HeroBanner";
import { InfoIcon } from "../components/svgIcons";
import { useEffect } from "react";
import { getGlobalData, updateDbData } from "../contexts/transaction";

export default function HomePage(props: { startLoading: Function, closeLoading: Function, openDeny: Function, closeDeny: Function }) {

    const getGlobalAllData = async () => {
        setInterval(() => {
            updateDbData()
        }, 5000)
    }

    useEffect(() => {
        getGlobalAllData();
    })
    return (
        <main>
            <HeroBanner />
            <div className="container">
                <div className="home-notice">
                    <p><InfoIcon /><span>We does not endorse the tokens listed and we always recommend to do your own research and make sure addresses match to the correct token.</span></p>
                </div>
                <ListedTokenTable
                    startLoading={props.startLoading}
                    closeLoading={props.closeLoading}
                    openDeny={props.openDeny}
                    closeDeny={props.closeDeny}
                />
            </div>

        </main>
    )
}


