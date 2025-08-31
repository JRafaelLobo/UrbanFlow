import { TransactionButton, useActiveAccount, useContractEvents, } from "thirdweb/react";
import { tokensClaimedEvent } from "thirdweb/extensions/erc721";
import { contract } from "@/constants/thirdweb";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ParallaxScrollView } from "@/components/ParallaxScrollView";
import { Button, Image, StyleSheet, View, useColorScheme } from "react-native";

import { createThirdwebClient, ThirdwebClient } from "thirdweb";
import {
    getContract,
    prepareContractCall,
    toUnits,
} from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";


export default function Interactuar() {
    const router = useRouter();
    const account = useActiveAccount();
    const theme = useColorScheme();
    account?.address


    const contractEvents = useContractEvents({
        contract,
        events: [tokensClaimedEvent({ claimer: account?.address })],
    });
    const clientId = process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID!;
    const secretKey = process.env.EXPO_PRIVATE_THIRDWEB_CLIENT_ID!;

    const THIRDWEB_CLIENT = createThirdwebClient({
        clientId,
        secretKey,
    });


    const velocidad = getContract({
        address: "0xACf072b740a23D48ECd302C9052fbeb3813b60a6",
        chain: arbitrumSepolia,
        client: THIRDWEB_CLIENT,
    });

    return (
        <>
            <ParallaxScrollView
                headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
                headerImage={
                    <Image
                        source={require("@/assets/images/nodos.jpg")}
                        style={styles.reactLogo}
                    />
                }
            >
                <TransactionButton
                    transaction={() =>
                        prepareContractCall({
                            contract: velocidad,
                            method:
                                "function transfer(address to, uint256 value) returns (bool)",
                            params: ["0x...", toUnits("5", 18)],
                        })
                    }
                >
                    Send
                </TransactionButton>
            </ParallaxScrollView>
        </>
    );

}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 40,
        marginTop: 30,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: "100%",
        width: "100%",
        bottom: 0,
        left: 0,
        position: "absolute",
    },
    rowContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 24,
        justifyContent: "space-evenly",
    },
    tableContainer: {
        width: "100%",
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    leftColumn: {
        flex: 1,
        textAlign: "left",
    },
    rightColumn: {
        flex: 1,
        textAlign: "right",
    },
});