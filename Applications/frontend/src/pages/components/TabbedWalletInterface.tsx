import React, { useState, ReactNode } from 'react';
import { Box, Tabs, Tab, Typography, Button, Paper, Divider, TextField } from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import SyncAltRoundedIcon from '@mui/icons-material/SyncAltRounded';
import { useTheme } from '@mui/material/styles';
import { provider } from '../../providers';
import { ethers } from 'ethers';
import sendTrans from '../../CreateTransaction';
import { simpleAccountAbi, erc20Abi } from '../../contracts';

// Define the type for TabPanel props
interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

interface AccountInfoProps {
  walletaddress: string;
}

const TabbedWalletInterface: React.FC<AccountInfoProps> = ({ walletaddress }) => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const [tokenAddress, setTokenAddress] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<number>(0);

  const handleFetchToken = async () => {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
        ],
        provider,
      );
      console.log('tokenAddress:', tokenAddress);
      console.log('walletAddress:', walletaddress);
      const tokenBalance = await contract.balanceOf(walletaddress);
      const tokenSymbol = await contract.symbol();
      const tokenDecimals = await contract.decimals();

      setBalance(ethers.utils.formatUnits(tokenBalance, tokenDecimals));
      setSymbol(tokenSymbol);
      setDecimals(tokenDecimals);
    } catch (error) {
      console.error('Error fetching token details:', error);
      setBalance(null);
      setSymbol(null);
      setDecimals(null);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSendToken = async () => {
    try {
      const encodeddata = simpleAccountAbi.encodeFunctionData('execute', [
        tokenAddress,
        0,
        erc20Abi.encodeFunctionData('transfer', [recipient, String(amount * 10 ** 18)]),
      ]);
      sendTrans(encodeddata);

      alert('Token sent successfully');
    } catch (error) {
      console.error('Error sending token:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={5}
        sx={{
          padding: '2rem',
          borderRadius: '20px',
          background: `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
          boxShadow: `0 4px 10px ${theme.palette.primary.dark}`,
          maxWidth: '450px',
          margin: 'auto',
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="wallet tabs"
          centered
          TabIndicatorProps={{
            style: {
              height: '4px',
              backgroundColor: theme.palette.secondary.main,
            },
          }}
        >
          <Tab
            icon={<AccountBalanceWalletRoundedIcon />}
            label="Token"
            {...a11yProps(0)}
            sx={{
              color: value === 0 ? theme.palette.secondary.main : theme.palette.text.primary,
              '&:hover': { color: theme.palette.secondary.main },
            }}
          />
          <Tab
            icon={<SwapHorizRoundedIcon />}
            label="Quick Convert"
            {...a11yProps(1)}
            sx={{
              color: value === 1 ? theme.palette.secondary.main : theme.palette.text.primary,
              '&:hover': { color: theme.palette.secondary.main },
            }}
          />
          <Tab
            icon={<SyncAltRoundedIcon />}
            label="Wrap ETH"
            {...a11yProps(2)}
            sx={{
              color: value === 2 ? theme.palette.secondary.main : theme.palette.text.primary,
              '&:hover': { color: theme.palette.secondary.main },
            }}
          />
        </Tabs>

        <TabPanel value={value} index={0}>
          <Typography variant="h6" sx={{ color: theme.palette.secondary.main }}>
            Token
          </Typography>
          <Divider sx={{ my: 2, borderColor: theme.palette.secondary.main }} />
          <Typography variant="body2" color="textSecondary">
            Manage your tokens.
          </Typography>

          <TextField
            fullWidth
            label="Token Address"
            variant="outlined"
            placeholder="Enter token address"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
          <Button variant="contained" color="primary" sx={{ mt: 2, textTransform: 'none' }} onClick={handleFetchToken}>
            Fetch Token
          </Button>
          {balance !== null && symbol !== null && decimals !== null && (
            <Box mt={4}>
              <Typography variant="body1">
                Balance: {balance} {symbol}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Symbol: {symbol}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Decimals: {decimals}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                label="Recipient Address"
                variant="outlined"
                placeholder="Enter recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />

              <TextField
                fullWidth
                label="Amount"
                variant="outlined"
                placeholder={`Enter amount in ${symbol}`}
                value={amount}
                type="number"
                onChange={(e) => setAmount(parseInt(e.target.value))}
                sx={{ mt: 2 }}
              />

              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 2, textTransform: 'none' }}
                onClick={handleSendToken}
                disabled={!balance || !recipient || !amount}
              >
                Send Token
              </Button>
            </Box>
          )}
          {/* <Typography variant="h6">Tokens</Typography> */}
          {/* <Button
            variant="outlined"
            color="primary"
            // onClick={handleOpenDialog}
            sx={{ mt: 2 }}
          >
            Import Tokens
          </Button> */}
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Typography variant="h6" sx={{ color: theme.palette.secondary.main }}>
            Quick Convert
          </Typography>
          <Divider sx={{ my: 2, borderColor: theme.palette.secondary.main }} />
          <Typography variant="body2" color="textSecondary">
            Convert your tokens instantly.
          </Typography>
          <TextField fullWidth label="Token Address" variant="outlined" placeholder="Enter token address" />
          <Button
            variant="contained"
            color="secondary"
            sx={{
              mt: 2,
              textTransform: 'none',
              boxShadow: `0 2px 5px ${theme.palette.secondary.dark}`,
            }}
          >
            Convert
          </Button>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Typography variant="h6" sx={{ color: theme.palette.secondary.main }}>
            Wrap ETH
          </Typography>
          <Divider sx={{ my: 2, borderColor: theme.palette.secondary.main }} />
          <Typography variant="body2" color="textSecondary">
            Convert ETH to WETH.
          </Typography>
          <TextField fullWidth label="ETH Amount" variant="outlined" placeholder="Enter token address" />
          <Button
            variant="contained"
            color="warning"
            sx={{
              mt: 2,
              textTransform: 'none',
              boxShadow: `0 2px 5px ${theme.palette.warning.dark}`,
            }}
          >
            Wrap ETH
          </Button>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default TabbedWalletInterface;
