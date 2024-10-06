import axios from 'axios';
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
import frontImg from './assets/new.jpeg';
import CameraHolder, { CameraHandle } from './CameraHolder';
import ChatBubble, { ChatBubbleHandle } from './ChatBubble';
import homeImg from './assets/logo.svg';
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
import { Link } from 'react-router-dom';
import Wallet from './pages/Wallet';
enum STEPS {
  home,
  username,
  polaroid,
  wallet,
}

function PhotoBooth() {
  const webcamRef = useRef<CameraHandle | null>(null);
  const [webcamReady, setWebcamReady] = useState(false);
  const onWebcamReady = useCallback(() => {
    setWebcamReady(true);
  }, []);
  const chatBubbleRef = useRef<ChatBubbleHandle | null>(null);

  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const uploadToIPFS = useCallback(async (blob: Blob | null): Promise<string> => {
    if (blob === null) throw new Error('no blob');

    try {
      let data = new FormData();
      data.append('file', blob);
      data.append('pinataOptions', '{"cidVersion": 0}');
      data.append('pinataMetadata', '{"name": "sepc256r1 wallet"}');

      const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlNjAyZTFkNy0yZWJhLTRkMzYtYmNhYy02N2M4NGJkODRjYWEiLCJlbWFpbCI6IjQ1MTVAbWJjcGVlcm1hZGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjVlMDhlMTk0NDdmYzY2NTJmMGJjIiwic2NvcGVkS2V5U2VjcmV0IjoiNWNkNGViOWQ3ZjkzYzMxYWQwNGE3MThkYTJmNWNhNTIzZjdlNjZmMjY5OWVjY2I2ZmI5YjkyZGYxMTUyNDRlMiIsImV4cCI6MTc1NjQwNDUzOH0.As43wJPpFUKaQE-__tmcmRja16O4ty9ARjgR4Cwt6EI',
        },
      });

      console.log(res.data);
      console.log(`View the file here: https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`);
      return res.data.IpfsHash;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to upload file to IPFS');
    }
  }, []);

  const [login, setLogin] = useState(localStorage.getItem('login') || '');
  const [loginConfirmed, setLoginConfirmed] = useState(!!localStorage.getItem('login'));
  const [mywallet, setMywallet] = useState('');

  if (login != '') {
    getAddress(login).then((walletAddress) => setMywallet(walletAddress));
  }

  const [transactionHash, setTransactionHash] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<'waiting' | 'confirmed' | 'error'>();
  const sendTransaction = useCallback(
    async (blob: Blob | null | undefined) => {
      if (!login) throw Error('Login not set');
      if (!blob) throw new Error('no blob');

      setTransactionStatus('waiting');
      const hash = await uploadToIPFS(blob);
      console.log('yo hash', hash);
      console.log('yo login', login);

      const walletAddress = await getAddress(login);
      console.log('yo walletAddress', walletAddress);
      const userOpBuilder = new UserOperationBuilder()
        .useDefaults({
          sender: walletAddress,
        })
        .useMiddleware(Presets.Middleware.getGasPrice(provider))
        .setCallData(
          simpleAccountAbi.encodeFunctionData('execute', [
            nftPolaroidContract.address,
            0,
            nftPolaroidContract.interface.encodeFunctionData('mint', [Buffer.from(hash)]),
          ]),
        )
        .setNonce(await entrypointContract.getNonce(walletAddress, 0));
      // =================================================================================
      // const userOpBuilder = new UserOperationBuilder()
      //   .useDefaults({
      //     sender: walletAddress,
      //   })
      //   .useMiddleware(Presets.Middleware.getGasPrice(provider))
      //   .setCallData(
      //     simpleAccountAbi.encodeFunctionData('execute', [
      //       '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
      //       0,
      //       erc20Abi.encodeFunctionData('transfer', [
      //         '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      //         '500000000000000000000',
      //       ]),
      //     ]),
      //   )
      //   .setNonce(await entrypointContract.getNonce(walletAddress, 0));
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
      console.log(typeof gasLimits.callGasLimit);
      const userOp: IUserOperation = {
        ...baseUserOp,
        callGasLimit: ethers.utils.parseUnits('0.01', 'gwei').toHexString(),
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
          setTransactionHash(receipt.hash);
          setTransactionStatus('confirmed');
          console.log({ receipt });
          const events = await nftPolaroidContract.queryFilter(
            nftPolaroidContract.filters.Transfer(ethers.constants.AddressZero, walletAddress),
            receipt.blockNumber,
          );
          console.log({ events });
          await webcamRef.current?.reveal();
          const tokenUri = await nftPolaroidContract.tokenURI(events[0].args?.tokenId);
          console.log(
            `https://coral-quick-ptarmigan-625.mypinata.cloud/ipfs/${tokenUri.replace('ipfs://', '')}`,
            tokenUri,
          );
          const { data: metadata } = await axios.get(
            `https://coral-quick-ptarmigan-625.mypinata.cloud/ipfs/${tokenUri.replace('ipfs://', '')}`,
          );
          console.log(metadata);
          chatBubbleRef.current?.show();
        })
        .catch((e) => {
          setTransactionStatus('error');
          console.error(e);
        });
    },
    [login, imageBlob],
  );

  const [cameraRequested, setCameraRequested] = useState(false);
  const onActivateCamera = useCallback(() => {
    setCameraRequested(true);
  }, []);
  const onScreenshot = useCallback(async () => {
    if (!cameraRequested) throw new Error('Camera is not set');

    const { blob } = (await webcamRef.current?.takeScreenshot()) || {};
    setImageBlob(blob || null);
    console.log('yo in');
    sendTransaction(blob);
  }, [imageBlob, login, cameraRequested]);

  const step = useMemo(() => {
    if (!cameraRequested) {
      return STEPS.home;
    }
    if (cameraRequested && !loginConfirmed) {
      return STEPS.username;
    }
    if (transactionStatus === 'confirmed') {
      return STEPS.wallet;
    }
    if (cameraRequested && loginConfirmed) {
      return STEPS.polaroid;
    }
  }, [cameraRequested, loginConfirmed, transactionStatus]);

  return (
    <div
      className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full bg-gray-100 rounded-lg shadow-md p-6"
      style={{ backgroundImage: `url(${frontImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {step === STEPS.home && (
        <>
          <img className="w-full h-48 mb-12" src={homeImg} alt="" />
          <button
            className="btn btn-primary w-3/4 break-words bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
            onClick={onActivateCamera}
          >
            {' '}
            Create Wallet
          </button>
        </>
      )}
      {step === STEPS.username && (
        <div className="form-control w-full max-w-xs items-center">
          <label className="label self-start">
            <span className="label-text text-lg">Choose an username</span>
          </label>
          <input
            type="text"
            placeholder="qdqd"
            className="input input-bordered glass w-full max-w-xs"
            value={login}
            onChange={(e) => {
              setLogin(e.target.value.toLocaleLowerCase());
            }}
          />
          <button
            className="btn btn-neutral w-1/2 mt-10"
            onClick={() => {
              setLoginConfirmed(true);
              localStorage.setItem('login', login);
            }}
            disabled={login.length < 3}
          >
            {login.length < 3 ? `Nope` : "I'm good"}
          </button>
        </div>
      )}
      {step === STEPS.polaroid && (
        <div className="flex flex-col w-full h-full justify-center items-center">
          <div className="w-10/12 md:w-9/12 lg:full relative">
            <CameraHolder ref={webcamRef} cameraRequested={cameraRequested} onReady={onWebcamReady} />
          </div>
          <div className="pt-10 w-9/12 flex align-center justify-between gap-2 flex-wrap">
            {!imageBlob && (
              <button className="btn btn-secondary flex-grow" onClick={onScreenshot} disabled={!webcamReady}>
                {webcamReady ? 'Click a selfie !' : <span className="loading loading-dots"></span>}
              </button>
            )}
            {imageBlob && transactionStatus === 'waiting' && (
              <button className="btn btn-secondary flex-grow" disabled>
                <span className="loading loading-dots"></span>
              </button>
            )}
          </div>
        </div>
      )}
      {step === STEPS.wallet && (
        <div className="flex flex-col w-full h-full justify-center items-center">
          <Wallet wallet={mywallet} />
        </div>
      )}

      {/* <ChatBubble ref={chatBubbleRef} transactionHash={transactionHash} /> */}
    </div>
  );
}

export default memo(PhotoBooth);
