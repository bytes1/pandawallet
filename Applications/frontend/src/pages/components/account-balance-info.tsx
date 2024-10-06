import { Stack, Typography, Chip, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { provider } from '../../providers';
import kakarot from '../../assets/kakarot.jpg';
import { ethers } from 'ethers';

interface AccountInfoProps {
  walletaddress: string;
}

const AccountBalanceInfo: React.FC<AccountInfoProps> = ({ walletaddress }) => {
  const [balance, setBalance] = useState<string | null>(null);

  const getBalance = async (address: string) => {
    try {
      // Fetch the balance of the given address
      const balanceBigNumber = await provider.getBalance(address);

      // Convert balance from wei to ether
      const balance = ethers.utils.formatEther(balanceBigNumber);

      console.log(`Balance of address ${address}: ${balance} ETH`);
      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (walletaddress) {
        const balance = await getBalance(walletaddress);
        if (balance) {
          setBalance(parseFloat(balance).toFixed(4));
        }
      }
    };

    fetchBalance();
  }, [walletaddress]);

  return (
    <Stack spacing={1} justifyContent="center" alignItems="center">
      <img
        height={70}
        width={70} // Ensures the icon remains small and square
        src={kakarot}
        alt="asset logo"
        style={{ objectFit: 'contain' }} // Prevents distortion
      />

      {<Typography variant="h3">{balance !== null ? `${balance} ETH` : 'Loading...'}</Typography>}
      {/* <Tooltip
          title={
            walletDeployed
              ? `Wallet has been deployed on ${activeNetwork.name} chain`
              : `Wallet is not deployed on ${activeNetwork.name} chain, it will be deployed upon the first transaction`
          }
        >
          <Chip
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/deploy-account')}
            variant="outlined"
            color={walletDeployed ? 'success' : 'error'}
            size="small"
            icon={walletDeployed ? <CheckCircleIcon /> : <CancelIcon />}
            label={
              accountData === 'loading'
                ? 'Loading deployment status...'
                : walletDeployed
                ? 'Deployed'
                : 'Not deployed'
            }
          />
        </Tooltip> */}
    </Stack>
  );
};

export default AccountBalanceInfo;
