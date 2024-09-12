"use client";
import * as ethers from "ethers";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import {
    GeneratePrivateKeyResult,
    EthereumLitTransaction,
    SerializedTransaction,
} from "@lit-protocol/wrapped-keys-bc";
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
} from "@solana/web3.js";
import { generateWrappedKey } from "../lit/generateWrappedKey";
import { signMessageWithWrappedKey } from "../lit/signMessageWithWrappedKey";
import { signTransactionWithWrappedKey } from "../lit/signTransactionWithWrappedKey";
import { mintAndDelegateCapacityCredit } from "../lit/mintAndDelegateCapacityCredit";
import { mintPkp } from "../lit/utils";

export default function Home() {
    const ETHEREUM_PRIVATE_KEY: string | undefined =
        process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;

    async function handleTestsEvm(litNetwork: LitNetwork) {
        console.log(`generateWrappedKey() on ${litNetwork}`);

        if (!ETHEREUM_PRIVATE_KEY) {
            throw new Error(
                "Ethereum private key is not defined in environment variables"
            );
        }

        const ethersSigner = new ethers.Wallet(
            ETHEREUM_PRIVATE_KEY,
            new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
        );
        const mintedPkp = await mintPkp(ethersSigner, litNetwork);
        console.log("mintedPkp: ", mintedPkp);

        let capacityDelegationAuthSig;

        if (litNetwork != LitNetwork.DatilDev) {
            capacityDelegationAuthSig = await mintAndDelegateCapacityCredit(
                ethersSigner,
                litNetwork,
                mintedPkp!.ethAddress
            );
        }

        let generateWrappedKeyResponse;

        if (litNetwork != LitNetwork.DatilDev) {
            generateWrappedKeyResponse = (await generateWrappedKey(
                mintedPkp!.publicKey,
                "evm",
                "This is a Dev Guide code example testing Ethereum key",
                litNetwork,
                capacityDelegationAuthSig
            )) as GeneratePrivateKeyResult;
            console.log(
                "generateWrappedKeyResponse: ",
                generateWrappedKeyResponse
            );
        } else {
            generateWrappedKeyResponse = (await generateWrappedKey(
                mintedPkp!.publicKey,
                "evm",
                "This is a Dev Guide code example testing Ethereum key",
                litNetwork,
                undefined
            )) as GeneratePrivateKeyResult;
            console.log(
                "generateWrappedKeyResponse: ",
                generateWrappedKeyResponse
            );
        }

        console.log("signMsg()");

        const messageToSign = ethers.utils.toUtf8Bytes(
            "The answer to the universe is 42"
        );

        if (litNetwork != LitNetwork.DatilDev) {
            const signedMessage = (await signMessageWithWrappedKey(
                mintedPkp!.publicKey,
                "evm",
                generateWrappedKeyResponse.id,
                messageToSign,
                litNetwork,
                capacityDelegationAuthSig
            )) as string;
            console.log("signedMessage", signedMessage);
        } else {
            const signedMessage = (await signMessageWithWrappedKey(
                mintedPkp!.publicKey,
                "evm",
                generateWrappedKeyResponse.id,
                messageToSign,
                litNetwork,
                undefined
            )) as string;
            console.log("signedMessage", signedMessage);
        }

        console.log("signTx()");

        const litTransaction: EthereumLitTransaction = {
            chainId: 175188,
            chain: "chronicleTestnet",
            toAddress: ethersSigner.address,
            value: "0.0001",
            gasLimit: 21_000,
        };

        if (litNetwork != LitNetwork.DatilDev) {
            const signedTransaction = await signTransactionWithWrappedKey(
                mintedPkp!.publicKey,
                "evm",
                generateWrappedKeyResponse.id,
                litTransaction,
                false,
                litNetwork,
                capacityDelegationAuthSig
            );
            console.log("signedTransaction", signedTransaction);
        } else {
            const signedTransaction = await signTransactionWithWrappedKey(
                mintedPkp!.publicKey,
                "evm",
                generateWrappedKeyResponse.id,
                litTransaction,
                false,
                litNetwork,
                undefined
            );
            console.log("signedTransaction", signedTransaction);
        }
    }

    async function handleTestsSolana(litNetwork: LitNetwork) {
        console.log(`generateWrappedKey() on ${litNetwork}`);

        if (!ETHEREUM_PRIVATE_KEY) {
            throw new Error(
                "Ethereum private key is not defined in environment variables"
            );
        }

        const ethersSigner = new ethers.Wallet(
            ETHEREUM_PRIVATE_KEY,
            new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
        );
        const mintedPkp = await mintPkp(ethersSigner, litNetwork);

        let capacityDelegationAuthSig;

        if (litNetwork != LitNetwork.DatilDev) {
            capacityDelegationAuthSig = await mintAndDelegateCapacityCredit(
                ethersSigner,
                litNetwork,
                mintedPkp!.ethAddress
            );
        }

        let generateWrappedKeyResponse;

        if (litNetwork != LitNetwork.DatilDev) {
            generateWrappedKeyResponse = (await generateWrappedKey(
                mintedPkp!.publicKey,
                "evm",
                "This is a Dev Guide code example testing Ethereum key",
                litNetwork,
                capacityDelegationAuthSig
            )) as GeneratePrivateKeyResult;
            console.log(
                "generateWrappedKeyResponse: ",
                generateWrappedKeyResponse
            );
        } else {
            generateWrappedKeyResponse = (await generateWrappedKey(
                mintedPkp!.publicKey,
                "evm",
                "This is a Dev Guide code example testing Ethereum key",
                litNetwork,
                undefined
            )) as GeneratePrivateKeyResult;
            console.log(
                "generateWrappedKeyResponse: ",
                generateWrappedKeyResponse
            );
        }

        console.log("generateWrappedKeyResponse", generateWrappedKeyResponse);

        console.log("signMsg()");

        const messageToSign = "The answer to the universe is 42";

        if (litNetwork != LitNetwork.DatilDev) {
            const signedMessage = (await signMessageWithWrappedKey(
                mintedPkp!.publicKey,
                "solana",
                generateWrappedKeyResponse.id,
                messageToSign,
                litNetwork,
                capacityDelegationAuthSig
            )) as string;
            console.log("signedMessage", signedMessage);
        } else {
            const signedMessage = (await signMessageWithWrappedKey(
                mintedPkp!.publicKey,
                "solana",
                generateWrappedKeyResponse.id,
                messageToSign,
                litNetwork,
                undefined
            )) as string;
            console.log("signedMessage", signedMessage);
        }

        console.log("signTx()");

        const generatedSolanaPublicKey = new PublicKey(
            generateWrappedKeyResponse.generatedPublicKey
        );

        const solanaTransaction = new Transaction();
        solanaTransaction.add(
            SystemProgram.transfer({
                fromPubkey: generatedSolanaPublicKey,
                toPubkey: generatedSolanaPublicKey,
                lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
            })
        );
        solanaTransaction.feePayer = generatedSolanaPublicKey;

        const solanaConnection = new Connection(
            clusterApiUrl("devnet"),
            "confirmed"
        );
        const { blockhash } = await solanaConnection.getLatestBlockhash();
        solanaTransaction.recentBlockhash = blockhash;

        const serializedTransaction = solanaTransaction
            .serialize({
                requireAllSignatures: false, // should be false as we're not signing the message
                verifySignatures: false, // should be false as we're not signing the message
            })
            .toString("base64");

        const litTransaction: SerializedTransaction = {
            serializedTransaction,
            chain: "devnet",
        };

        if (litNetwork != LitNetwork.DatilDev) {
            const signedTransaction = await signTransactionWithWrappedKey(
                mintedPkp!.publicKey,
                "solana",
                generateWrappedKeyResponse.id,
                litTransaction,
                false,
                litNetwork,
                capacityDelegationAuthSig
            );
            console.log("signedTransaction", signedTransaction);
        } else {
            const signedTransaction = await signTransactionWithWrappedKey(
                mintedPkp!.publicKey,
                "solana",
                generateWrappedKeyResponse.id,
                litTransaction,
                false,
                litNetwork,
                undefined
            );
            console.log("signedTransaction", signedTransaction);
        }
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen py-10">
            <div className="space-y-4 mb-8 text-center">
                <h1 className="text-2xl font-semibold text-white-800">
                    EVM Wrapped Key Tests
                </h1>
                <div className="flex gap-3">
                    <button
                        className="bg-gray-600 text-white px-5 py-3 rounded-md hover:bg-blue-800 transition duration-300"
                        onClick={() => {
                            handleTestsEvm(LitNetwork.DatilDev);
                        }}
                    >
                        Run Tests on Datil Dev
                    </button>
                    <button
                        className="bg-gray-600 text-white px-5 py-3 rounded-md hover:bg-blue-800 transition duration-300"
                        onClick={() => {
                            handleTestsEvm(LitNetwork.DatilTest);
                        }}
                    >
                        Run Tests on Datil Test
                    </button>
                    <button
                        className="bg-gray-600 text-white px-5 py-3 rounded-md hover:bg-blue-800 transition duration-300"
                        onClick={() => {
                            handleTestsEvm(LitNetwork.Datil);
                        }}
                    >
                        Run Tests on Datil
                    </button>
                </div>
            </div>

            <div className="space-y-4 text-center">
                <h1 className="text-2xl font-semibold text-white-800">
                    Solana Wrapped Keys Tests
                </h1>
                <div className="flex gap-3">
                    <button
                        className="bg-gray-600 text-white px-5 py-3 rounded-md hover:bg-blue-800 transition duration-300"
                        onClick={() => {
                            handleTestsSolana(LitNetwork.DatilDev);
                        }}
                    >
                        Run Tests on Datil Dev
                    </button>
                    <button
                        className="bg-gray-600 text-white px-5 py-3 rounded-md hover:bg-blue-800 transition duration-300"
                        onClick={() => {
                            handleTestsSolana(LitNetwork.DatilTest);
                        }}
                    >
                        Run Tests on Datil Test
                    </button>
                    <button
                        className="bg-gray-600 text-white px-5 py-3 rounded-md hover:bg-blue-800 transition duration-300"
                        onClick={() => {
                            handleTestsSolana(LitNetwork.Datil);
                        }}
                    >
                        Run Tests on Datil
                    </button>
                </div>
            </div>
        </div>
    );
}
