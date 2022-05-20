import ListedTokenTable from "../components/ListedTokenTable";
import HeroBanner from "../components/HeroBanner";
import { InfoIcon } from "../components/svgIcons";
export default function HomePage(props: { startLoading: Function, closeLoading: Function }) {
  return (
    <main>
      <HeroBanner />
      <div className="container">
        <div className="home-notice">
          <p><InfoIcon /><span>We does not endorse the tokens listed and we always recommend to do your own research and make sure addresses match to the correct token.</span></p>
        </div>
        <ListedTokenTable
          startLoading={props.startLoading}
          closeLoading={props.closeLoading} />
      </div>

    </main>
  )
}


