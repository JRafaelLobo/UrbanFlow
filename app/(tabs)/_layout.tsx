import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack, Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Stack
			screenOptions={{
				headerShown: false, // Oculta la barra superior, cámbialo a true si quieres mostrar títulos
			}}
		>
			<Stack.Screen
				name="index"
				options={{
					title: "iniciar",
				}}
			/>
			<Stack.Screen
				name="read"
				options={{
					title: "Read",
				}}
			/>
			<Stack.Screen
				name="write"
				options={{
					title: "Write",
				}}
			/>
			<Stack.Screen
				name="buy"
				options={{
					title: "Buy",
				}}
			/>
			<Stack.Screen
				name="interactuar"
				options={{
					title: "Interact",
				}}
			/>
			<Stack.Screen
				name="map"
				options={{
					title: "map",
				}}
			/>
		</Stack>
	);
}
