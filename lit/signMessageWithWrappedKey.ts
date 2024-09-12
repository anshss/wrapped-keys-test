import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { api } from "@lit-protocol/wrapped-keys-bc";

const { signMessageWithEncryptedKey } = api;

const ETHEREUM_PRIVATE_KEY: string | undefined =
  process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;

export const signMessageWithWrappedKey = async (
  pkpPublicKey: string,
  evmOrSolana: "evm" | "solana",
  wrappedKeyId: string,
  messageToSign: string | Uint8Array
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
      litNetwork: LitNetwork.DatilTest,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Getting PKP Session Sigs...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersSigner,
        uses: "1000",
      });
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey,
      authMethods: [
        await EthWalletProvider.authenticate({
          signer: ethersSigner,
          litNodeClient,
          expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        }),
      ],
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      capacityDelegationAuthSig,
    });
    console.log("✅ Got PKP Session Sigs");

    console.log("🔄 Signing message with Wrapped Key...");
    const signedMessage = await signMessageWithEncryptedKey({
      pkpSessionSigs,
      network: evmOrSolana,
      id: wrappedKeyId,
      messageToSign,
      litNodeClient,
    });
    console.log("✅ Signed message");
    return signedMessage;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
