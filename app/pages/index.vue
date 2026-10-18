<script setup lang="ts">
import { homeFeatures, setupSteps } from "~/data/features";

usePageSeo({
	title: "NetIgnite — Power On Devices From Anywhere",
	description:
		"Remotely power on and monitor the devices in your network with Wake-on-LAN agents. Use the hosted app or self-host the open-source NetIgnite server.",
	jsonLd: {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "NetIgnite",
		url: "https://netignite.dev",
		applicationCategory: "UtilitiesApplication",
		operatingSystem: "Web",
		description: "Power on devices from anywhere with Wake-on-LAN agents.",
		license: "https://www.gnu.org/licenses/agpl-3.0.html",
	},
});

const heroDevices = [
	{ icon: "i-lucide-router", label: "Router Online", class: "bg-green-700 text-white" },
	{ icon: "i-lucide-monitor", label: "PC Standby", class: "bg-amber-400 text-slate-900" },
	{ icon: "i-lucide-server", label: "Server Offline", class: "bg-red-600 text-white" },
	{ icon: "i-lucide-printer", label: "Printer Ready", class: "bg-cyan-400 text-white" },
];
</script>

<template>
	<div>
		<!-- Hero -->
		<section class="pb-12">
			<UContainer>
				<div
					class="grid min-h-[calc(100vh-var(--ui-header-height))] items-center gap-12 py-12 lg:grid-cols-2"
				>
					<div>
						<h1 class="mb-6 text-5xl/tight font-bold text-white md:text-6xl/tight xl:text-7xl/tight">
							<span class="text-primary">Power On</span> Devices<br />
							From Anywhere
						</h1>
						<p class="mb-6 text-xl/relaxed text-slate-200 md:text-2xl/relaxed">
							Take control of your network infrastructure with NetIgnite. Remotely manage, monitor,
							and power on devices across your entire network with enterprise-grade security and
							reliability.
						</p>
						<div class="flex flex-col gap-4 sm:flex-row">
							<UButton
								to="https://app.netignite.dev/auth/login"
								target="_blank"
								icon="i-lucide-log-in"
								size="xl"
								class="justify-center px-6 py-3 text-lg font-bold"
							>
								Create Account
							</UButton>
							<UButton
								to="/docs/server/installation"
								icon="i-lucide-circle-arrow-down"
								size="xl"
								variant="outline"
								class="justify-center px-6 py-3 text-lg font-bold ring-primary hover:bg-primary hover:text-inverted"
							>
								Install Self-Hosted
							</UButton>
						</div>
						<p class="mt-6 flex items-center gap-2 text-sm text-slate-300">
							<UIcon name="i-lucide-circle-check" class="size-4 text-primary" />
							Free for personal use with up to 5 devices.
						</p>
					</div>

					<div class="hero-float relative text-center">
						<div class="rounded-2xl p-6 shadow-2xl shadow-black/40">
							<div class="grid grid-cols-2 gap-4">
								<div
									v-for="device in heroDevices"
									:key="device.label"
									class="rounded-xl p-4 text-center transition-transform duration-200 hover:scale-105"
									:class="device.class"
								>
									<UIcon :name="device.icon" class="mb-2 size-10" />
									<div class="text-sm">{{ device.label }}</div>
								</div>
							</div>
						</div>
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div class="hero-pulse size-25 rounded-full bg-primary opacity-25" />
						</div>
					</div>
				</div>
			</UContainer>
		</section>

		<!-- Features -->
		<section id="features" class="bg-surface py-16">
			<UContainer>
				<div class="mx-auto mb-12 max-w-3xl text-center">
					<h2 class="mb-4 text-4xl font-bold text-white md:text-5xl">Powerful Remote Management</h2>
					<p class="text-xl text-slate-200">
						Everything you need to manage your network devices remotely with confidence and security.
					</p>
				</div>
				<div class="grid gap-6 md:grid-cols-3">
					<FeatureCard
						v-for="feature in homeFeatures"
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

		<!-- How it works -->
		<section id="how-it-works" class="py-16">
			<UContainer>
				<div class="mx-auto mb-12 max-w-3xl text-center">
					<h2 class="mb-4 text-4xl font-bold text-white md:text-5xl">How It Works</h2>
					<p class="text-xl text-slate-200">Get started in minutes with our simple three-step process.</p>
				</div>
				<div class="grid gap-10 md:grid-cols-3">
					<div v-for="(step, index) in setupSteps" :key="step.title" class="text-center">
						<div
							class="mb-4 inline-flex size-15 items-center justify-center rounded-full bg-primary text-2xl font-bold text-inverted"
						>
							{{ index + 1 }}
						</div>
						<h3 class="mb-4 text-2xl font-bold text-white">{{ step.title }}</h3>
						<p class="text-slate-200">{{ step.description }}</p>
					</div>
				</div>
			</UContainer>
		</section>

		<!-- CTA -->
		<section class="py-16">
			<UContainer>
				<div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div class="lg:max-w-3xl">
						<h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">Ready to Power Up Your Network?</h2>
						<p class="text-xl text-slate-200">
							Join thousands of IT professionals who trust NetIgnite for remote device management.
						</p>
					</div>
					<UButton
						to="/docs/getting-started"
						icon="i-lucide-rocket"
						size="xl"
						class="justify-center self-start px-6 py-3 text-lg font-bold lg:self-center"
					>
						Get Started Now
					</UButton>
				</div>
			</UContainer>
		</section>
	</div>
</template>

<style scoped>
.hero-float {
	animation: float 6s ease-in-out infinite;
}

.hero-pulse {
	animation: pulse 2s infinite;
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}

	50% {
		transform: translateY(-20px);
	}
}

@keyframes pulse {
	0%,
	100% {
		transform: scale(0.8);
		opacity: 0.3;
	}

	50% {
		transform: scale(1.2);
		opacity: 0.1;
	}
}

@media (prefers-reduced-motion: reduce) {
	.hero-float,
	.hero-pulse {
		animation: none;
	}
}
</style>
