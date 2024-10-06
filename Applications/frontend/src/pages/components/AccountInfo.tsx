import { Box, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { useCallback, useState } from 'react';

interface AccountInfoProps {
  walletAddress: string;
  // tooltipMessage: string;
  // copyAddress: () => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ walletAddress }) => {
  const [tooltipMessage, setTooltipMessage] = useState<string>('Copy address');

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(walletAddress);
    setTooltipMessage('Address copied');
  }, [walletAddress]);

  return (
    <Box
      component="div"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      sx={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.20)',
        position: 'relative',
      }}
    >
      <Box
        component="div"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
      >
        <Tooltip title={tooltipMessage} enterDelay={0}>
          <Box
            onClick={copyAddress}
            component="div"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              minWidth: 300,
              borderRadius: 4,
              cursor: 'pointer',
              '&:hover': {
                background: '#f2f4f6',
              },
            }}
          >
            <Typography variant="h6">{'my wallet'}</Typography>

            <Box component="div" display="flex" flexDirection="row" justifyContent="center" alignItems="center">
              <Typography variant="overline">
                {walletAddress.substring(0, 5)}...
                {walletAddress.substring(walletAddress.length - 5)}
              </Typography>
              <ContentCopyIcon sx={{ height: 16, cursor: 'pointer' }} />
            </Box>
          </Box>
        </Tooltip>
      </Box>
      <MoreVertIcon sx={{ position: 'absolute', right: 0 }} />
    </Box>
  );
};

export default AccountInfo;
