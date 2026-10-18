<script setup lang="ts">
import type { FeatureTone } from "~/data/features";

const {
	icon,
	title,
	tone = "primary",
} = defineProps<{
	icon: string;
	title: string;
	tone?: FeatureTone;
}>();

// Static class map — Tailwind can't see interpolated class names.
const toneClasses: Record<FeatureTone, { tile: string; icon: string }> = {
	primary: { tile: "bg-primary/10", icon: "text-primary" },
	amber: { tile: "bg-amber-400/10", icon: "text-amber-400" },
	green: { tile: "bg-green-600/10", icon: "text-green-600" },
	cyan: { tile: "bg-cyan-400/10", icon: "text-cyan-400" },
	red: { tile: "bg-red-500/10", icon: "text-red-500" },
	slate: { tile: "bg-slate-500/10", icon: "text-slate-500" },
};
</script>

<template>
	<div
		class="h-full rounded-2xl bg-night p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
	>
		<div class="mb-4 inline-flex rounded-xl p-4" :class="toneClasses[tone].tile">
			<UIcon :name="icon" class="size-8" :class="toneClasses[tone].icon" />
		</div>
		<h3 class="mb-4 text-2xl font-bold text-white">{{ title }}</h3>
		<p class="text-slate-200">
			<slot />
		</p>
	</div>
</template>
