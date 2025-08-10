<template>
	<div class="landing-page">

		<!-- Hero Section -->
		<section class="hero-section text-white pb-5">
			<div class="container">
				<div class="row align-items-center" style="min-height: calc(100vh - 6rem);">
					<div class="col-lg-6">
						<h1 class="display-3 fw-bold mb-4">
							<span class="text-primary">Power On</span> Devices<br>
							From Anywhere
						</h1>
						<p class="lead mb-4 fs-4">
							Take control of your network infrastructure with NetIgnite.
							Remotely manage, monitor, and power on devices across your entire network
							with enterprise-grade security and reliability.
						</p>
						<div class="d-flex flex-column flex-sm-row gap-3">
							<button class="btn btn-primary btn-lg text-dark fw-bold px-4 py-3">
								<i class="bi bi-box-arrow-in-right me-2"></i>
								Create Account
							</button>
							<button class="btn btn-outline-primary btn-lg hero-btn-outline fw-bold px-4 py-3">
								<i class="bi bi-arrow-down-circle me-2"></i>
								Install Self-Hosted
							</button>
						</div>
						<div class="mt-4">
							<small class="text-light opacity-75">
								<i class="bi bi-check-circle-fill text-primary me-2"></i>
								Free for personal use with up to 5 devices.
							</small>
						</div>
					</div>
					<div class="col-lg-6 text-center">
						<div class="hero-image-container position-relative">
							<div class="rounded-4 p-4 shadow-lg">
								<div class="row g-3">
									<div class="col-6">
										<div class="device-card bg-success text-white rounded-3 p-3 text-center">
											<i class="bi bi-router fs-1 mb-2"></i>
											<div class="small">Router Online</div>
										</div>
									</div>
									<div class="col-6">
										<div class="device-card bg-warning text-dark rounded-3 p-3 text-center">
											<i class="bi bi-pc-display fs-1 mb-2"></i>
											<div class="small">PC Standby</div>
										</div>
									</div>
									<div class="col-6">
										<div class="device-card bg-danger text-white rounded-3 p-3 text-center">
											<i class="bi bi-hdd-network fs-1 mb-2"></i>
											<div class="small">Server Offline</div>
										</div>
									</div>
									<div class="col-6">
										<div class="device-card bg-info text-white rounded-3 p-3 text-center">
											<i class="bi bi-printer fs-1 mb-2"></i>
											<div class="small">Printer Ready</div>
										</div>
									</div>
								</div>
							</div>
							<div
								class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
								<div class="pulse-animation bg-primary rounded-circle opacity-25"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Section -->
		<section id="features" class="py-5">
			<div class="container">
				<div class="row">
					<div class="col-lg-8 mx-auto text-center mb-5">
						<h2 class="display-5 fw-bold mb-3">Powerful Remote Management</h2>
						<p class="lead text">
							Everything you need to manage your network devices remotely with confidence and security.
						</p>
					</div>
				</div>
				<div class="row g-4">
					<div class="col-md-4">
						<div class="feature-card h-100 rounded-4 p-4 shadow-sm border-0">
							<div class="feature-icon bg-warning bg-opacity-10 rounded-3 p-3 mb-3 d-inline-block">
								<i class="bi bi-lightning-charge-fill text-warning fs-2"></i>
							</div>
							<h4 class="fw-bold mb-3">Wake-on-LAN</h4>
							<p>
								Power on devices remotely using Wake-on-LAN technology.
								Support for multiple protocols and network configurations.
							</p>
						</div>
					</div>
					<div class="col-md-4">
						<div class="feature-card h-100 rounded-4 p-4 shadow-sm border-0">
							<div class="feature-icon bg-primary bg-opacity-10 rounded-3 p-3 mb-3 d-inline-block">
								<i class="bi bi-shield-check text-primary fs-2"></i>
							</div>
							<h4 class="fw-bold mb-3">Secure Access</h4>
							<p>
								Enterprise-grade security with encrypted connections,
								multi-factor authentication, and role-based access control.
							</p>
						</div>
					</div>
					<div class="col-md-4">
						<div class="feature-card h-100 rounded-4 p-4 shadow-sm border-0">
							<div class="feature-icon bg-success bg-opacity-10 rounded-3 p-3 mb-3 d-inline-block">
								<i class="bi bi-graph-up text-success fs-2"></i>
							</div>
							<h4 class="fw-bold mb-3">Real-time Monitoring</h4>
							<p>
								Monitor device status, network performance, and power consumption
								with real-time dashboards and alerts.
							</p>
						</div>
					</div>
					<div class="col-md-4">
						<div class="feature-card h-100 rounded-4 p-4 shadow-sm border-0">
							<div class="feature-icon bg-info bg-opacity-10 rounded-3 p-3 mb-3 d-inline-block">
								<i class="bi bi-clock-history text-info fs-2"></i>
							</div>
							<h4 class="fw-bold mb-3">Scheduled Actions</h4>
							<p>
								Automate device power management with intelligent scheduling
								and energy-saving policies.
							</p>
						</div>
					</div>
					<div class="col-md-4">
						<div class="feature-card h-100 rounded-4 p-4 shadow-sm border-0">
							<div class="feature-icon bg-danger bg-opacity-10 rounded-3 p-3 mb-3 d-inline-block">
								<i class="bi bi-phone text-danger fs-2"></i>
							</div>
							<h4 class="fw-bold mb-3">Mobile App</h4>
							<p>
								PWA-Based Mobile apps for iOS and Android with full feature parity
								and offline capabilities.
							</p>
						</div>
					</div>
					<div class="col-md-4">
						<div class="feature-card h-100 rounded-4 p-4 shadow-sm border-0">
							<div class="feature-icon bg-secondary bg-opacity-10 rounded-3 p-3 mb-3 d-inline-block">
								<i class="bi bi-puzzle text-secondary fs-2"></i>
							</div>
							<h4 class="fw-bold mb-3">API Integration</h4>
							<p>
								Comprehensive REST API for custom integrations with your existing
								infrastructure and automation tools.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- How It Works Section -->
		<section id="how-it-works" class="py-5">
			<div class="container">
				<div class="row">
					<div class="col-lg-8 mx-auto text-center mb-5">
						<h2 class="display-5 fw-bold mb-3">How It Works</h2>
						<p class="lead">
							Get started in minutes with our simple three-step process.
						</p>
					</div>
				</div>
				<div class="row g-4">
					<div class="col-md-4 text-center">
						<div
							class="step-number bg-primary text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
							<span class="fw-bold fs-4">1</span>
						</div>
						<h4 class="fw-bold mb-3">Install Agent</h4>
						<p>
							Deploy our lightweight agent on your network or use our cloud-based solution
							for instant setup.
						</p>
					</div>
					<div class="col-md-4 text-center">
						<div
							class="step-number bg-primary text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
							<span class="fw-bold fs-4">2</span>
						</div>
						<h4 class="fw-bold mb-3">Discover Devices</h4>
						<p>
							Automatically discover and catalog all network devices with their
							capabilities and current status.
						</p>
					</div>
					<div class="col-md-4 text-center">
						<div
							class="step-number bg-primary text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
							<span class="fw-bold fs-4">3</span>
						</div>
						<h4 class="fw-bold mb-3">Take Control</h4>
						<p>
							Start managing your devices remotely through our intuitive dashboard
							or mobile app.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="py-5 text-white">
			<div class="container">
				<div class="row align-items-center">
					<div class="col-lg-8">
						<h3 class="display-6 fw-bold mb-3">Ready to Power Up Your Network?</h3>
						<p class="lead mb-0">
							Join thousands of IT professionals who trust NetIgnite for remote device management.
						</p>
					</div>
					<div class="col-lg-4 text-lg-end">
						<button class="btn btn-primary btn-lg text-dark fw-bold px-4 py-3">
							<i class="bi bi-rocket-takeoff me-2"></i>
							Get Started Now
						</button>
					</div>
				</div>
			</div>
		</section>		
	</div>
</template>

<style scoped>
.bg-gradient {
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.step-number {
	width: 60px;
	height: 60px;
	font-size: 1.5rem;
}

#features {
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

.pulse-animation {
	width: 100px;
	height: 100px;
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		transform: scale(0.8);
		opacity: 0.3;
	}

	50% {
		transform: scale(1.2);
		opacity: 0.1;
	}

	100% {
		transform: scale(0.8);
		opacity: 0.3;
	}
}

.device-card {
	transition: transform 0.2s ease;
}

.device-card:hover {
	transform: scale(1.05);
}

.hero-image-container {
	animation: float 6s ease-in-out infinite;
}

@keyframes float {

	0%,
	100% {
		transform: translateY(0px);
	}

	50% {
		transform: translateY(-20px);
	}
}

.hero-btn-outline:hover {
	color: rgba(var(--bs-dark-rgb),var(--bs-text-opacity)) !important;
}

</style>

<script setup lang="ts">

useSeoMeta({
	title: 'NetIgnite - Power On Devices From Anywhere',
	description: 'NetIgnite - Power On Devices From Anywhere',
});

</script>
