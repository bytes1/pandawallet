import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PhotoBooth from './PhotoBooth';
import './index.css';
// import Wallet from './pages/Wallet';
import TransferAssetPage from './pages/transfer-asset';
import swap from './pages/swap';
const router = createBrowserRouter([
  { path: '/', Component: PhotoBooth },
  // { path: '/contact/:wallet', Component: Wallet },
  { path: '/transfer-assets', Component: TransferAssetPage },
  { path: '/swap', Component: swap },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
