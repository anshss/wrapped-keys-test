import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import {
    LitAbility,
    LitActionResource,
    AuthSig,
} from "@lit-protocol/auth-helpers";
import {
    api,
    EthereumLitTransaction,
    SerializedTransaction,
    SignTransactionWithEncryptedKeyParams,
} from "@lit-protocol/wrapped-keys-bc";

const { signTransactionWithEncryptedKey } = api;

const ETHEREUM_PRIVATE_KEY: string | undefined =
    process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;

export const signTransactionWithWrappedKey = async (
    pkpPublicKey: string,
    evmOrSolana: "evm" | "solana",
    wrappedKeyId: string,
    unsignedTransaction: EthereumLitTransaction | SerializedTransaction,
    broadcastTransaction: boolean,
    litNetwork: LitNetwork,
    capacityDelegationAuthSig: AuthSig | undefined
) => {
    let litNodeClient: LitNodeClient;

    try {
        if (!ETHEREUM_PRIVATE_KEY) {
            throw new Error(
                "Ethereum private key is not defined in environment variables"
            );
        }
        const ethersSigner = new ethers.Wallet(
            ETHEREUM_PRIVATE_KEY,
            new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
        );

        console.log("🔄 Connecting to Lit network...");
        litNodeClient = new LitNodeClient({
            litNetwork: litNetwork,
            debug: false,
        });
        await litNodeClient.connect();
        console.log("✅ Connected to Lit network");

        console.log("🔄 Getting PKP Session Sigs...");

        let pkpSessionSigs;

        if (litNetwork != LitNetwork.DatilDev) {
            if (!capacityDelegationAuthSig) {
                throw new Error(
                    "Capacity Delegation Auth Sig is required for non-DatilDev networks"
                );
            }
            console.log(
                "capacityDelegationAuthSig ",
                capacityDelegationAuthSig
            );
            pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
                pkpPublicKey,
                capabilityAuthSigs: [capacityDelegationAuthSig],
                authMethods: [
                    await EthWalletProvider.authenticate({
                        signer: ethersSigner,
                        litNodeClient,
                        expiration: new Date(
                            Date.now() + 1000 * 60 * 10
                        ).toISOString(), // 10 minutes
                    }),
                ],
                resourceAbilityRequests: [
                    {
                        resource: new LitActionResource("*"),
                        ability: LitAbility.LitActionExecution,
                    },
                ],
                expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
            });
            console.log("✅ Got PKP Session Sigs");
        } else {
            pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
                pkpPublicKey,
                authMethods: [
                    await EthWalletProvider.authenticate({
                        signer: ethersSigner,
                        litNodeClient,
                        expiration: new Date(
                            Date.now() + 1000 * 60 * 10
                        ).toISOString(), // 10 minutes
                    }),
                ],
                resourceAbilityRequests: [
                    {
                        resource: new LitActionResource("*"),
                        ability: LitAbility.LitActionExecution,
                    },
                ],
                expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
            });
            console.log("✅ Got PKP Session Sigs");
        }

        console.log("🔄 Signing transaction with Wrapped Key...");
        const signedTransaction = await signTransactionWithEncryptedKey({
            pkpSessionSigs,
            network: evmOrSolana,
            id: wrappedKeyId,
            unsignedTransaction,
            broadcast: broadcastTransaction,
            litNodeClient,
        } as SignTransactionWithEncryptedKeyParams);
        console.log("✅ Signed transaction");
        return signedTransaction;
    } catch (error) {
        console.error(error);
    } finally {
        litNodeClient!.disconnect();
    }
};
