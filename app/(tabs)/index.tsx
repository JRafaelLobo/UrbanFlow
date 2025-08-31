import { Button, Image, StyleSheet, View, useColorScheme } from "react-native";

import { ParallaxScrollView } from "@/components/ParallaxScrollView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { chain, client } from "@/constants/thirdweb";
import { useEffect, useState } from "react";
import { createAuth } from "thirdweb/auth";
import { baseSepolia, ethereum } from "thirdweb/chains";

import {
	ConnectButton,
	ConnectEmbed,
	lightTheme,
	useActiveAccount,
	useActiveWallet,
	useConnect,
	useDisconnect,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { createWallet } from "thirdweb/wallets";
import {
	getUserEmail,
	hasStoredPasskey,
	inAppWallet,
} from "thirdweb/wallets/in-app";
import { useRouter } from "expo-router";

const wallets = [
	inAppWallet({
		auth: {
			options: [
				"google",
				"facebook",
				"discord",
				"telegram",
				"email",
				"phone",
				"passkey",
			],
			passkeyDomain: "thirdweb.com",
		},
		smartAccount: {
			chain: baseSepolia,
			sponsorGas: true,
		},
	}),
	createWallet("io.metamask"),
	createWallet("com.coinbase.wallet", {
		appMetadata: {
			name: "Thirdweb RN Demo",
		},
		mobileConfig: {
			callbackURL: "com.thirdweb.demo://",
		},
		walletConfig: {
			options: "smartWalletOnly",
		},
	}),
	createWallet("me.rainbow"),
	createWallet("com.trustwallet.app"),
	createWallet("io.zerion.wallet"),
];

const thirdwebAuth = createAuth({
	domain: "localhost:3000",
	client,
});

// fake login state, this should be returned from the backend
let isLoggedIn = false;

export default function HomeScreen() {
	const router = useRouter();

	const account = useActiveAccount();
	const theme = useColorScheme();

	useEffect(() => {
		if (account) {
			router.replace("/map")
		}
	}, [account]);

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
			headerImage={
				<Image
					source={require("@/assets/images/nodos.jpg")}
					style={styles.reactLogo}
				/>
			}
		>

			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Inicio de Seccion</ThemedText>
			</ThemedView>
			<View style={{ gap: 2, margin: 20 }}>
				<ThemedText type="subtitle" style={{ gap: 2, margin: 5 }}>{`UrbanFlow`}</ThemedText>
				<ThemedText type="subtext" style={{ gap: 2, margin: 5 }}>
					Tu mejor forma de asegurar tu paquete
				</ThemedText>
			</View>
			<ConnectButton
				client={client}
				chain={ethereum}
				theme={lightTheme({
					colors: {
						primaryButtonBg: "#1e8449",
						modalBg: "#1e8449",
						borderColor: "#196f3d",
						accentButtonBg: "#196f3d",
						primaryText: "#ffffff",
						secondaryIconColor: "#a7b8b9",
						secondaryText: "#a7b8b9",
						secondaryButtonBg: "#196f3d",
					},
				})}
				wallets={[
					createWallet("io.metamask"),
					createWallet("com.coinbase.wallet"),
					createWallet("me.rainbow"),
					createWallet("com.trustwallet.app"),
					createWallet("io.zerion.wallet"),
					createWallet("xyz.argent"),
					createWallet("com.okex.wallet"),
					createWallet("com.zengo"),
				]}
				connectButton={{
					label: "Log In",
				}}
				connectModal={{
					title: "UrbanFlow",
				}}
			/>
			{ }
			{account && (<>
				<ThemedText type="subtext">
					Se ha iniciado Seccion
				</ThemedText>
			</>
			)}
		</ParallaxScrollView>
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
