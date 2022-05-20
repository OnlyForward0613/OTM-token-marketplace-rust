import { Skeleton } from "@mui/material";

export default function MarketOverviewSkeleton(props: { tokenPage?: boolean }) {
    return (
        <div className="market-overview" style={{ marginTop: 20 }}>
            <div className="token-symbol">
                <Skeleton variant="circular" width={32} height={32} sx={{ background: "#ffffff2e" }} />
                <Skeleton variant="rectangular" width={160} height={28} sx={{ background: "#ffffff2e", borderRadius: 1, marginLeft: 1 }} />
                <Skeleton variant="rectangular" width={60} height={28} sx={{ background: "#ffffff2e", borderRadius: 1, marginLeft: 1 }} />
            </div>
            <h3>Market Overview</h3>
            <div className="overview-item">
                <label className="title">Price</label>
                <Skeleton variant="rectangular" width={100} height={22.2} sx={{ background: "#ffffff2e", borderRadius: 1 }} />
            </div>
            <div className="overview-item">
                <label className="title">Max Total Supply</label>
                <Skeleton variant="rectangular" width={160} height={22.2} sx={{ background: "#ffffff2e", borderRadius: 1 }} />
            </div>
            <div className="overview-item">
                <label className="title">Holders</label>
                <Skeleton variant="rectangular" width={80} height={22.2} sx={{ background: "#ffffff2e", borderRadius: 1 }} />
            </div>
            {props.tokenPage &&
                <>
                    <div className="overview-item">
                        <label className="title">Descirption</label>
                        <Skeleton variant="rectangular" width={120} height={18.9} sx={{ background: "#ffffff2e", borderRadius: 1 }} />
                    </div>
                    <div className="overview-item">
                        <label className="title">twitter</label>
                        <Skeleton variant="rectangular" width={100} height={18.9} sx={{ background: "#ffffff2e", borderRadius: 1 }} />
                    </div>
                </>
            }
            <div className="overview-item">
                <label className="title">Website</label>
                <Skeleton variant="rectangular" width={120} height={18.9} sx={{ background: "#ffffff2e", borderRadius: 1 }} />
            </div>
        </div>
    )
}