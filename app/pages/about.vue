<script setup lang="ts">
usePageSeo({
	title: "About — NetIgnite",
	description:
		"NetIgnite helps teams and homelab operators power on and manage devices from anywhere — reliable remote access, secure control and fast recovery.",
});

const solvedProblems = [
	"Wake devices remotely with confidence",
	"Reduce on-site interventions and downtime",
	"Manage distributed infrastructure from one place",
];

// Static class map — Tailwind can't see interpolated class names.
const values = [
	{
		icon: "i-lucide-target",
		title: "Mission",
		description:
			"Make remote power management practical, secure, and easy to operate for every network size.",
		tile: "bg-primary/10",
		iconClass: "text-primary",
	},
	{
		icon: "i-lucide-shield-check",
		title: "Principles",
		description:
			"Security first, transparent defaults, and stable behavior in real-world network environments.",
		tile: "bg-green-600/10",
		iconClass: "text-green-600",
	},
	{
		icon: "i-lucide-zap",
		title: "Focus",
		description:
			"Fast setup, reliable wake triggers, and clean monitoring that helps you act immediately.",
		tile: "bg-amber-400/10",
		iconClass: "text-amber-400",
	},
];
</script>

<template>
	<div>
		<section class="py-12">
			<UContainer>
				<div
					class="grid min-h-[calc(70vh-var(--ui-header-height))] items-center gap-8 lg:grid-cols-12"
				>
					<div class="lg:col-span-7">
						<h1 class="mb-4 text-5xl font-bold text-white md:text-6xl">
							About <span class="text-primary">NetIgnite</span>
						</h1>
						<p class="mb-6 text-xl/relaxed text-slate-200">
							NetIgnite helps teams and homelab operators power on and manage devices from anywhere. Our
							focus is simple: reliable remote access, secure control, and fast recovery when systems
							are offline.
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
								to="/features"
								icon="i-lucide-sparkles"
								size="xl"
								variant="outline"
								class="justify-center px-6 py-3 text-lg font-bold ring-primary hover:bg-primary hover:text-inverted"
							>
								Explore Features
							</UButton>
						</div>
					</div>
					<div class="lg:col-span-5">
						<div
							class="h-full rounded-2xl bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
						>
							<h2 class="mb-4 text-2xl font-bold text-white">What we solve</h2>
							<ul class="space-y-4">
								<li
									v-for="item in solvedProblems"
									:key="item"
									class="flex items-start gap-2 text-slate-200"
								>
									<UIcon name="i-lucide-circle-check" class="mt-1 size-5 shrink-0 text-primary" />
									{{ item }}
								</li>
							</ul>
						</div>
					</div>
				</div>
			</UContainer>
		</section>

		<section class="bg-surface py-16">
			<UContainer>
				<div class="grid gap-6 md:grid-cols-3">
					<div
						v-for="value in values"
						:key="value.title"
						class="h-full rounded-2xl bg-night p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
					>
						<div class="mb-4 inline-flex rounded-xl p-4" :class="value.tile">
							<UIcon :name="value.icon" class="size-8" :class="value.iconClass" />
						</div>
						<h2 class="mb-4 text-2xl font-bold text-white">{{ value.title }}</h2>
						<p class="text-slate-200">{{ value.description }}</p>
					</div>
				</div>
			</UContainer>
		</section>

		<section class="py-16">
			<UContainer>
				<div class="rounded-2xl bg-surface p-6 lg:p-12">
					<div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h2 class="mb-2 text-3xl font-bold text-white">Build your remote power workflow</h2>
							<p class="text-xl text-slate-200">
								See how NetIgnite features fit your infrastructure and operations.
							</p>
						</div>
						<UButton
							to="/features"
							icon="i-lucide-circle-arrow-right"
							size="xl"
							class="justify-center self-start px-6 py-3 text-lg font-bold lg:self-center"
						>
							View Features
						</UButton>
					</div>
				</div>
			</UContainer>
		</section>
	</div>
</template>
