import { ethers, Contract } from 'ethers';
import walletFactory from './abis/webauthnWalletFactory.json';
import simpleAccount from './abis/simpleAccount.json';
import entrypoint from './abis/entrypoint.json';
import nftPolaroid from './abis/polaroid.json';
import erc20 from './abis/erc20.json';
import { provider } from './providers';

export const simpleAccountAbi = new ethers.utils.Interface(simpleAccount.abi);
export const erc20Abi = new ethers.utils.Interface(erc20.abi);
export const nftPolaroidContract = new Contract(import.meta.env.VITE_POLAROID_NFT_CONTRACT, nftPolaroid.abi, provider);
export const entrypointContract = new Contract(import.meta.env.VITE_ENTRYPOINT, entrypoint.abi, provider);
export const walletFactoryContract = new Contract(
  import.meta.env.VITE_WALLETFACTORY_CONTRACT,
  walletFactory.abi,
  provider,
);
