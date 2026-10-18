<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const appUrl = "https://app.netignite.dev/";

const links: NavigationMenuItem[] = [
	{
		label: "Home",
		to: "/",
		exact: true,
	},
	{
		label: "Features",
		to: "/features",
	},
	{
		label: "Docs",
		to: "/docs",
	},
	{
		label: "About",
		to: "/about",
	},
	{
		label: "GitHub",
		to: "https://github.com/NetIgnite-project/",
		target: "_blank",
	},
];

const mobileLinks: NavigationMenuItem[][] = [
	links,
	[
		{
			label: "Login",
			to: appUrl,
			target: "_blank",
			icon: "i-lucide-log-in",
		},
	],
];
</script>

<template>
	<UHeader title="NetIgnite" class="border-surface bg-surface/95 backdrop-blur-xl">
		<template #title>
			<!-- UHeader already links the title to "/"; don't nest another link here. -->
			<ImgAppLogo class="h-11 w-auto" />
		</template>

		<UNavigationMenu :items="links" :ui="{ link: 'text-lg' }" />

		<template #body>
			<UNavigationMenu :items="mobileLinks" orientation="vertical" class="w-full" />
		</template>

		<template #right>
			<!-- The darker brand blue of the original navbar's login button. -->
			<UButton
				:to="appUrl"
				target="_blank"
				size="lg"
				class="hidden bg-[#0050ff] px-4 text-lg font-medium text-white hover:bg-[#0046e0] sm:inline-flex"
			>
				Login
			</UButton>
		</template>
	</UHeader>
</template>
