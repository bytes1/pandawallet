import React, { useState } from 'react';
import { Container, TextField, Button, Stack, Typography, Paper } from '@mui/material';
import { simpleAccountAbi, erc20Abi } from '../contracts';
import sendTrans from '../CreateTransaction';
import { ethers } from 'ethers';

const TransferAssetPage = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const handleSendToken = async () => {
    try {
      const encodeddata = simpleAccountAbi.encodeFunctionData('execute', [
        recipient,
        ethers.utils.parseEther(String(amount)),
        '0x',
      ]);
      sendTrans(encodeddata);

      alert('Token sent successfully');
    } catch (error) {
      console.error('Error sending token:', error);
    }
  };
  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Paper elevation={3} style={{ padding: '2rem', borderRadius: '15px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Transfer Asset
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="To Address"
            variant="outlined"
            placeholder="Enter recipient's address"
            onChange={(e) => setRecipient(e.target.value)}
          />

          <TextField
            fullWidth
            label="Amount"
            variant="outlined"
            placeholder="Enter amount to send"
            type="number"
            onChange={(e) => setAmount(parseInt(e.target.value))}
            InputProps={{ inputProps: { min: 0 } }}
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            style={{ textTransform: 'none' }}
            onClick={handleSendToken}
          >
            Send
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default TransferAssetPage;
