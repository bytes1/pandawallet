// src/pages/About.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import AccountInfo from './components/AccountInfo';
import AccountBalanceInfo from './components/account-balance-info';
import TransferAssetButton from './components/transfer-asset-button';
import { Stack } from '@mui/material';
import TabbedWalletInterface from './components/TabbedWalletInterface';
interface AccountBalanceInfoProps {
  wallet: string;
}

const Wallet: React.FC<AccountBalanceInfoProps> = ({ wallet }) => {
  // const { wallet } = useParams<{ wallet: string }>();
  const walletAddress = wallet ? wallet : '0x0000000000000000000000000000000000000000';

  return (
    <Stack spacing={1} justifyContent="center" alignItems="center">
      <AccountInfo walletAddress={walletAddress} />
      <AccountBalanceInfo walletaddress={walletAddress} />
      <TransferAssetButton />
      <TabbedWalletInterface walletaddress={walletAddress} />
    </Stack>
  );
};

export default Wallet;
