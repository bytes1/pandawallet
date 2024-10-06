import { useCallback, useRef, useState, memo, useMemo } from 'react';
import { ethers } from 'ethers';
import { IUserOperation, Presets, UserOperationBuilder } from 'userop';
import {
  simpleAccountAbi,
  entrypointContract,
  walletFactoryContract,
  nftPolaroidContract,
  erc20Abi,
} from './contracts';

import { provider } from './providers';
import {
  getAddress,
  getGasLimits,
  getPaymasterData,
  sendUserOp,
  signUserOp,
  signUserOpWithCreate,
  userOpToSolidity,
} from './walletTools';

export default function sendTrans(encodeddata: string) {
  const login = localStorage.getItem('login') || '';

  const sendTransaction = async () => {
    console.log('yo login', login);
    const walletAddress = await getAddress(login);

    //   const walletAddress = await getAddress(login);
    //   console.log('yo walletAddress', walletAddress);
    //   const userOpBuilder = new UserOperationBuilder()
    //     .useDefaults({
    //       sender: walletAddress,
    //     })
    //     .useMiddleware(Presets.Middleware.getGasPrice(provider))
    //     .setCallData(
    //       simpleAccountAbi.encodeFunctionData('execute', [
    //         nftPolaroidContract.address,
    //         0,
    //         nftPolaroidContract.interface.encodeFunctionData('mint', [Buffer.from(hash)]),
    //       ]),
    //     )
    //     .setNonce(await entrypointContract.getNonce(walletAddress, 0));
    // =================================================================================
    const userOpBuilder = new UserOperationBuilder()
      .useDefaults({
        sender: walletAddress,
      })
      .useMiddleware(Presets.Middleware.getGasPrice(provider))
      .setCallData(encodeddata)
      .setNonce(await entrypointContract.getNonce(walletAddress, 0));
    // ===========================================================================================================================
    // const userOpBuilder = new UserOperationBuilder()
    //   .useDefaults({
    //     sender: walletAddress,
    //   })
    //   .useMiddleware(Presets.Middleware.getGasPrice(provider))
    //   .setCallData(
    //     simpleAccountAbi.encodeFunctionData('executeBatch', [
    //       ['0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6', '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'],
    //       [],
    //       [
    //         erc20Abi.encodeFunctionData('transfer', [
    //           '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    //           '500000000000000000000',
    //         ]),
    //         erc20Abi.encodeFunctionData('transfer', [
    //           '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    //           '500000000000000000000',
    //         ]),
    //       ],
    //     ]),
    //   )
    //   .setNonce(await entrypointContract.getNonce(walletAddress, 0));

    const walletCode = await provider.getCode(walletAddress);
    console.log('yo walletCode', walletCode);
    const walletExists = walletCode !== '0x';
    console.log('yo walletExists', walletExists);
    console.log({ walletExists });

    if (!walletExists) {
      userOpBuilder.setInitCode(
        walletFactoryContract.address +
          walletFactoryContract.interface.encodeFunctionData('createAccount(string,uint256)', [login, 0]).slice(2),
      );
    }

    const { chainId } = await provider.getNetwork();
    const userOpToEstimateNoPaymaster = await userOpBuilder.buildOp(import.meta.env.VITE_ENTRYPOINT, chainId);
    console.log('userOpTo', userOpToEstimateNoPaymaster);
    const paymasterAndData = await getPaymasterData(userOpToEstimateNoPaymaster);
    console.log('paymasterdata:', paymasterAndData);
    const userOpToEstimate = {
      ...userOpToEstimateNoPaymaster,
      paymasterAndData,
    };
    console.log({ userOpToEstimate });
    console.log('estimated userop', userOpToSolidity(userOpToEstimate));

    const [gasLimits, baseUserOp] = await Promise.all([
      getGasLimits(userOpToEstimate),
      userOpBuilder.buildOp(import.meta.env.VITE_ENTRYPOINT, chainId),
    ]);
    console.log({
      gasLimits: Object.fromEntries(
        Object.entries(gasLimits).map(([key, value]) => [key, ethers.BigNumber.from(value).toString()]),
      ),
    });
    const userOp: IUserOperation = {
      ...baseUserOp,
      callGasLimit: gasLimits.callGasLimit,
      preVerificationGas: gasLimits.preVerificationGas,
      verificationGasLimit: gasLimits.verificationGasLimit,
      paymasterAndData,
    };

    console.log({ userOp });
    // console.log('to sign', userOpToSolidity(userOp));
    const userOpHash = await entrypointContract.getUserOpHash(userOp);
    console.log('TO SIGN', { userOpHash });
    const loginPasskeyId = localStorage.getItem(`${login}_passkeyId`);
    const signature = loginPasskeyId
      ? await signUserOp(userOpHash, loginPasskeyId)
      : await signUserOpWithCreate(userOpHash, login);

    if (!signature) throw new Error('Signature failed');
    const signedUserOp: IUserOperation = {
      ...userOp,
      // paymasterAndData: await getPaymasterData(userOp),
      signature,
    };
    console.log({ signedUserOp });
    console.log('signed', userOpToSolidity(signedUserOp));

    sendUserOp(signedUserOp)
      .then(async (receipt) => {
        await receipt.wait();

        console.log({ receipt });
        console.log('sucess');
      })
      .catch((e) => {
        console.error(e);
      });
  };
  sendTransaction();
}
