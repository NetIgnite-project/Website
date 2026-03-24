<template>
	<div class="about-page">
		<section class="hero-section text-white py-5">
			<div class="container">
				<div class="row align-items-center g-4" style="min-height: calc(70vh - 6rem);">
					<div class="col-lg-7">
						<h1 class="display-4 fw-bold mb-3">
							About <span class="text-primary">NetIgnite</span>
						</h1>
						<p class="lead mb-4">
							NetIgnite helps teams and homelab operators power on and manage devices from anywhere.
							Our focus is simple: reliable remote access, secure control, and fast recovery when systems are offline.
						</p>
						<div class="d-flex flex-column flex-sm-row gap-3">
							<a class="btn btn-primary btn-lg text-dark fw-bold px-4 py-3" href="https://app.netignite.dev/auth/login" target="_blank">
								<i class="bi bi-box-arrow-in-right me-2"></i>
								Create Account
							</a>
							<NuxtLink class="btn btn-outline-primary btn-lg fw-bold px-4 py-3" to="/features">
								<i class="bi bi-stars me-2"></i>
								Explore Features
							</NuxtLink>
						</div>
					</div>
					<div class="col-lg-5">
						<div class="rounded-4 p-4 shadow-sm feature-card h-100">
							<h4 class="fw-bold mb-3">What we solve</h4>
							<ul class="list-unstyled mb-0">
								<li class="mb-3"><i class="bi bi-check-circle-fill text-primary me-2"></i>Wake devices remotely with confidence</li>
								<li class="mb-3"><i class="bi bi-check-circle-fill text-primary me-2"></i>Reduce on-site interventions and downtime</li>
								<li><i class="bi bi-check-circle-fill text-primary me-2"></i>Manage distributed infrastructure from one place</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="py-5 about-section">
			<div class="container">
				<div class="row g-4">
					<div class="col-md-4">
						<div class="rounded-4 p-4 h-100 feature-card shadow-sm">
							<div class="feature-icon bg-primary-opacity-10 rounded-3 p-3 mb-3 d-inline-block">
								<i class="bi bi-bullseye text-primary fs-2"></i>
							</div>
							<h4 class="fw-bold mb-3">Mission</h4>
							<p class="mb-0">Make remote power management practical, secure, and easy to operate for every network size.</p>
						</div>
					</div>
					<div class="col-md-4">
						<div class="rounded-4 p-4 h-100 feature-card shadow-sm">
							<div class="feature-icon bg-success bg-opacity-10 rounded-3 p-3 mb-3 d-inline-block">
								<i class="bi bi-shield-check text-success fs-2"></i>
							</div>
							<h4 class="fw-bold mb-3">Principles</h4>
							<p class="mb-0">Security first, transparent defaults, and stable behavior in real-world network environments.</p>
						</div>
					</div>
					<div class="col-md-4">
						<div class="rounded-4 p-4 h-100 feature-card shadow-sm">
							<div class="feature-icon bg-warning bg-opacity-10 rounded-3 p-3 mb-3 d-inline-block">
								<i class="bi bi-lightning-charge-fill text-warning fs-2"></i>
							</div>
							<h4 class="fw-bold mb-3">Focus</h4>
							<p class="mb-0">Fast setup, reliable wake triggers, and clean monitoring that helps you act immediately.</p>
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
							<h3 class="fw-bold mb-2">Build your remote power workflow</h3>
							<p class="lead mb-0">See how NetIgnite features fit your infrastructure and operations.</p>
						</div>
						<div class="col-lg-4 text-lg-end">
							<NuxtLink to="/features" class="btn btn-primary btn-lg text-dark fw-bold px-4 py-3">
								<i class="bi bi-arrow-right-circle me-2"></i>
								View Features
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style scoped>

.about-section {
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

useSeoMeta({
	title: 'About | NetIgnite',
	description: 'NetIgnite - Power On Devices From Anywhere',
});

</script>