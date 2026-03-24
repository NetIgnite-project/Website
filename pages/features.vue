<template>
	<div class="features-page">
		<section class="hero-section text-white py-5">
			<div class="container">
				<div class="row align-items-center g-4" style="min-height: calc(60vh - 6rem);">
					<div class="col-lg-8">
						<h1 class="display-4 fw-bold mb-3">
							Platform <span class="text-primary">Features</span>
						</h1>
						<p class="lead mb-0">
							Everything you need to discover devices, trigger remote power actions,
							and keep your infrastructure available from anywhere.
						</p>
					</div>
					<div class="col-lg-4 text-lg-end">
						<a class="btn btn-primary btn-lg text-dark fw-bold px-4 py-3" href="https://app.netignite.dev/auth/login" target="_blank">
							<i class="bi bi-rocket-takeoff me-2"></i>
							Get Started
						</a>
					</div>
				</div>
			</div>
		</section>

		<section class="py-5 feature-section">
			<div class="container">
				<div class="row g-4">
					<div class="col-md-6 col-xl-4" v-for="feature in coreFeatures" :key="feature.title">
						<div class="feature-card h-100 rounded-4 p-4 shadow-sm border-0">
							<div :class="feature.iconWrapClass + ' rounded-3 p-3 mb-3 d-inline-block'">
								<i :class="feature.iconClass"></i>
							</div>
							<h4 class="fw-bold mb-3">{{ feature.title }}</h4>
							<p class="mb-0">{{ feature.description }}</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="py-5 text-white">
			<div class="container">
				<div class="row g-4">
					<div class="col-lg-6">
						<div class="rounded-4 p-4 h-100 feature-card shadow-sm">
							<h3 class="fw-bold mb-3">Operational Highlights</h3>
							<ul class="list-unstyled mb-0">
								<li class="mb-3"><i class="bi bi-check-circle-fill text-primary me-2"></i>Centralized overview of device state and reachability</li>
								<li class="mb-3"><i class="bi bi-check-circle-fill text-primary me-2"></i>Reliable Wake-on-LAN dispatch with retries and validation</li>
								<li><i class="bi bi-check-circle-fill text-primary me-2"></i>Role-based controls for secure team operations</li>
							</ul>
						</div>
					</div>
					<div class="col-lg-6">
						<div class="rounded-4 p-4 h-100 feature-card shadow-sm">
							<h3 class="fw-bold mb-3">Built for Growth</h3>
							<ul class="list-unstyled mb-0">
								<li class="mb-3"><i class="bi bi-check-circle-fill text-primary me-2"></i>REST API and webhooks for automation and integrations</li>
								<li class="mb-3"><i class="bi bi-check-circle-fill text-primary me-2"></i>Dashboard designed for both homelabs and enterprise fleets</li>
								<li><i class="bi bi-check-circle-fill text-primary me-2"></i>Continuous improvements with focus on reliability and usability</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="py-5 text-white">
			<div class="container">
				<div class="rounded-4 p-4 p-lg-5 cta-box">
					<div class="row align-items-center g-3">
						<div class="col-lg-8">
							<h3 class="fw-bold mb-2">Want to see the full platform in action?</h3>
							<p class="lead mb-0">Create your account or learn more about the team and mission behind NetIgnite.</p>
						</div>
						<div class="col-lg-4 text-lg-end d-flex flex-column flex-sm-row justify-content-lg-end gap-2">
							<a class="btn btn-primary btn-lg text-dark fw-bold px-4 py-3" href="https://app.netignite.dev/auth/login" target="_blank">Create Account</a>
							<NuxtLink class="btn btn-outline-primary btn-lg fw-bold px-4 py-3" to="/about">About Us</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style scoped>

.feature-section {
	background-color: #1a1b2e;
}

.feature-card {
	background-color: #0b0c1b;
	transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
}

.cta-box {
	background-color: #1a1b2e;
}

</style>

<script setup lang="ts">

import { NuxtLink } from '#components';

const coreFeatures = [
	{
		title: 'Wake-on-LAN Control',
		description: 'Power on offline systems remotely with structured workflows and fast response times.',
		iconWrapClass: 'bg-warning bg-opacity-10',
		iconClass: 'bi bi-lightning-charge-fill text-warning fs-2',
	},
	{
		title: 'Secure Access',
		description: 'Protect your environment with encrypted traffic, strict authentication, and access controls.',
		iconWrapClass: 'bg-primary bg-opacity-10',
		iconClass: 'bi bi-shield-check text-primary fs-2',
	},
	{
		title: 'Real-time Visibility',
		description: 'Track status, uptime, and health signals in real time from a single dashboard.',
		iconWrapClass: 'bg-success bg-opacity-10',
		iconClass: 'bi bi-graph-up text-success fs-2',
	},
	{
		title: 'Scheduled Actions',
		description: 'Automate power routines for maintenance windows, daily operations, and energy savings.',
		iconWrapClass: 'bg-info bg-opacity-10',
		iconClass: 'bi bi-clock-history text-info fs-2',
	},
	{
		title: 'Mobile Ready',
		description: 'Use a responsive interface and PWA support to manage critical tasks while on the move.',
		iconWrapClass: 'bg-danger bg-opacity-10',
		iconClass: 'bi bi-phone text-danger fs-2',
	},
	{
		title: 'API Integration',
		description: 'Connect NetIgnite to your tools with a flexible REST API built for automation.',
		iconWrapClass: 'bg-secondary bg-opacity-10',
		iconClass: 'bi bi-puzzle text-secondary fs-2',
	},
];

useSeoMeta({
	title: 'Features | NetIgnite',
	description: 'NetIgnite - Power On Devices From Anywhere',
});

</script>