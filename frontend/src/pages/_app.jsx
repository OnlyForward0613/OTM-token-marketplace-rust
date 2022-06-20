import '../styles/style.scss'
import Wallet from '../components/wallet/Wallet'
import Header from '../components/Header'
import { ToastContainer } from 'react-toastify'
import PageLoading from '../components/PageLoading'
import { useState } from 'react'

function RaffleApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  const [deny, setDeny] = useState(false);
  return (
    <Wallet>
      <Header deny={deny} />
      <Component
        {...pageProps}
        startLoading={() => setLoading(true)}
        closeLoading={() => setLoading(false)}
        openDeny={() => setDeny(true)}
        closeDeny={() => setDeny(false)}
      />
      <ToastContainer style={{ fontSize: 14 }} />
      <PageLoading loading={loading} />
    </Wallet>
  )
}

export default RaffleApp
