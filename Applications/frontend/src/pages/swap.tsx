import React, { useState } from 'react';
import { Box, Button, MenuItem, TextField, Paper, Typography, InputAdornment, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components for Uniswap-like design
const SwapCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: '#fff',
  maxWidth: '420px',
  margin: 'auto',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
}));

const TokenField = styled(TextField)({
  '& .MuiInputBase-root': {
    paddingRight: '10px',
  },
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: '#e5e7eb',
  },
  '& .MuiSvgIcon-root': {
    color: '#000',
  },
});

const SwapButton = styled(Button)({
  backgroundColor: '#5c67f2',
  color: '#fff',
  marginTop: '20px',
  height: '56px',
  fontWeight: 'bold',
  fontSize: '18px',
  '&:hover': {
    backgroundColor: '#434bb3',
  },
});

const SwapPage: React.FC = () => {
  const [tokenFrom, setTokenFrom] = useState('ETH');
  const [tokenTo, setTokenTo] = useState('KUSDC');
  const [amount, setAmount] = useState('');

  const handleTokenChangeFrom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedToken = event.target.value;
    setTokenFrom(selectedToken);

    // Automatically change the "To" token if it matches the "From" token or defaults to a valid option
    if (selectedToken === tokenTo) {
      setTokenTo(selectedToken === 'KUSDT' ? 'ETH' : 'KUSDT');
    }
  };

  const handleTokenChangeTo = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenTo(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6fc">
      <SwapCard elevation={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
          Swap
        </Typography>

        {/* From Token Selection with Amount Input */}
        <TokenField
          select
          label="From"
          value={tokenFrom}
          onChange={handleTokenChangeFrom}
          fullWidth
          margin="normal"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Avatar src={`/tokens/${tokenFrom.toLowerCase()}.png`} sx={{ width: 24, height: 24 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <TextField
                  placeholder="Amount"
                  value={amount}
                  onChange={handleAmountChange}
                  variant="standard"
                  type="number"
                  inputProps={{ style: { textAlign: 'right' } }} // Align amount to the right
                  sx={{ width: '100px' }}
                />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="ETH">ETH</MenuItem>
          <MenuItem value="BTC">BTC</MenuItem>
          <MenuItem value="KUSDC">KUSDC</MenuItem>
          <MenuItem value="KUSDT">KUSDT</MenuItem>
        </TokenField>

        {/* To Token Selection */}
        <TokenField
          select
          label="To"
          value={tokenTo}
          onChange={handleTokenChangeTo}
          fullWidth
          margin="normal"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Avatar src={`/tokens/${tokenTo?.toLowerCase()}.png`} sx={{ width: 24, height: 24 }} />
              </InputAdornment>
            ),
          }}
        >
          {/* Disable the option that's already selected in "From" */}
          <MenuItem value="ETH" disabled={tokenFrom === 'ETH'}>
            ETH
          </MenuItem>
          <MenuItem value="BTC" disabled={tokenFrom === 'BTC'}>
            BTC
          </MenuItem>
          <MenuItem value="KUSDC" disabled={tokenFrom === 'KUSDC'}>
            USDC
          </MenuItem>
          <MenuItem value="KUSDT" disabled={tokenFrom === 'KUSDT'}>
            USDT
          </MenuItem>
        </TokenField>

        {/* Swap Button */}
        <SwapButton variant="contained" fullWidth disabled={!tokenFrom || !tokenTo || !amount}>
          Swap {tokenFrom} to {tokenTo}
        </SwapButton>
      </SwapCard>
    </Box>
  );
};

export default SwapPage;
