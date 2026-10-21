<script setup lang="ts">
import { platformFeatures } from "~/data/features";

usePageSeo({
	title: "Features — NetIgnite",
	description:
		"Wake-on-LAN, live status checks, shutdown and reboot, device sharing, agent updates over the network, an installable app and a REST API: what NetIgnite can do.",
});

const highlightCards = [
	{
		title: "Operational Highlights",
		items: [
			"One overview of all your devices and whether they're online",
			"Wake-on-LAN from an agent in the device's own network",
			"Per-device roles: viewer, operator and manager",
		],
	},
	{
		title: "Open and Extensible",
		items: [
			"REST API with API keys and an OpenAPI reference",
			"Agents for the ESP32 and for Linux, in as many networks as you like",
			"Open source under the AGPL-3.0, hosted or self-hosted",
		],
	},
];
</script>

<template>
	<div>
		<section class="py-12">
			<UContainer>
				<div
					class="flex min-h-[calc(60vh-var(--ui-header-height))] flex-col justify-center gap-6 lg:flex-row lg:items-center lg:justify-between"
				>
					<div class="lg:max-w-4xl">
						<h1 class="mb-4 text-5xl font-bold text-white md:text-6xl">
							Platform <span class="text-primary">Features</span>
						</h1>
						<p class="text-xl/relaxed text-slate-200">
							Everything you need to power devices on and off remotely, see whether they're online,
							and share them with the people who need them.
						</p>
					</div>
					<UButton
						to="https://app.netignite.dev/auth/login"
						target="_blank"
						icon="i-lucide-rocket"
						size="xl"
						class="justify-center self-start px-6 py-3 text-lg font-bold lg:self-center"
					>
						Get Started
					</UButton>
				</div>
			</UContainer>
		</section>

		<section class="bg-surface py-16">
			<UContainer>
				<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					<FeatureCard
						v-for="feature in platformFeatures"
						:key="feature.title"
						:icon="feature.icon"
						:title="feature.title"
						:tone="feature.tone"
					>
						{{ feature.description }}
					</FeatureCard>
				</div>
			</UContainer>
		</section>

		<section class="py-16">
			<UContainer>
				<div class="grid gap-6 lg:grid-cols-2">
					<div
						v-for="card in highlightCards"
						:key="card.title"
						class="h-full rounded-2xl bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
					>
						<h2 class="mb-4 text-3xl font-bold text-white">{{ card.title }}</h2>
						<ul class="space-y-4">
							<li v-for="item in card.items" :key="item" class="flex items-start gap-2 text-slate-200">
								<UIcon name="i-lucide-circle-check" class="mt-1 size-5 shrink-0 text-primary" />
								{{ item }}
							</li>
						</ul>
					</div>
				</div>
			</UContainer>
		</section>

		<section class="py-8">
			<UContainer>
				<div class="rounded-2xl bg-surface p-6 lg:p-12">
					<div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h2 class="mb-2 text-3xl font-bold text-white">Want to see the full platform in action?</h2>
							<p class="text-xl text-slate-200">
								Create your account or learn more about the team and mission behind NetIgnite.
							</p>
						</div>
						<div class="flex shrink-0 flex-col gap-3 sm:flex-row">
							<UButton
								to="https://app.netignite.dev/auth/login"
								target="_blank"
								size="xl"
								class="justify-center px-6 py-3 text-lg font-bold"
							>
								Create Account
							</UButton>
							<UButton
								to="/about"
								size="xl"
								variant="outline"
								class="justify-center px-6 py-3 text-lg font-bold ring-primary hover:bg-primary hover:text-inverted"
							>
								About Us
							</UButton>
						</div>
					</div>
				</div>
			</UContainer>
		</section>
	</div>
</template>
