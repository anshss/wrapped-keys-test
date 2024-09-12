/* eslint-disable @typescript-eslint/no-unused-vars */
import ethers from "ethers";
import { LitNetwork } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

export const mintAndDelegateCapacityCredit = async (
    ethersSigner: ethers.Wallet,
    litNetwork: LitNetwork,
    pkpEthAddress: string
) => {
    try {
        // console.log("🔄 Connecting to Lit network...");
        // const litContractClient = new LitContracts({
        //     signer: ethersSigner,
        //     network: litNetwork,
        // });
        // await litContractClient.connect();
        // console.log("✅ Connected to Lit network");

        // console.log("🔄 Minting Capacity Credit NFT via contract...");
        // const capacityCreditInfo =
        //     await litContractClient.mintCapacityCreditsNFT({
        //         requestsPerKilosecond: 40,
        //         daysUntilUTCMidnightExpiration: 1,
        //     });
        // console.log(
        //     `✅ Minted Capacity Credit with ID: ${capacityCreditInfo.capacityTokenIdStr}. Tx hash: ${capacityCreditInfo.rliTxHash}`
        // );

        console.log("🔄 Connecting to Lit network...");
        const litNodeClient = new LitNodeClient({
            litNetwork: litNetwork,
            debug: false,
        });
        await litNodeClient.connect();
        console.log("✅ Connected to Lit network");

        const { capacityDelegationAuthSig } =
            await litNodeClient.createCapacityDelegationAuthSig({
                dAppOwnerWallet: ethersSigner,
                // capacityTokenId: capacityCreditInfo.capacityTokenIdStr,
                // delegateeAddresses: [pkpEthAddress],
                uses: "1000",
            });
        console.log("✅ Capacity Delegation Auth Sig created");

        return capacityDelegationAuthSig;
    } catch (error) {
        console.error(error);
    }
};
