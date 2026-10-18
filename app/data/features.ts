/**
 * Marketing content for the landing and features pages.
 * Follows the style-guide "static data in app/data/" idiom.
 */

/** Accent color of a feature's icon tile; mapped to static classes in `FeatureCard.vue`. */
export type FeatureTone = "primary" | "amber" | "green" | "cyan" | "red" | "slate";

export interface Feature {
	icon: string;
	title: string;
	description: string;
	tone: FeatureTone;
}

export interface SetupStep {
	title: string;
	description: string;
}

/** Feature grid on the landing page. */
export const homeFeatures: Feature[] = [
	{
		icon: "i-lucide-zap",
		title: "Wake-on-LAN",
		description:
			"Power on devices remotely using Wake-on-LAN technology. Support for multiple protocols and network configurations.",
		tone: "amber",
	},
	{
		icon: "i-lucide-shield-check",
		title: "Secure Access",
		description:
			"Enterprise-grade security with encrypted connections, multi-factor authentication, and role-based access control.",
		tone: "primary",
	},
	{
		icon: "i-lucide-chart-line",
		title: "Real-time Monitoring",
		description:
			"Monitor device status, network performance, and power consumption with real-time dashboards and alerts.",
		tone: "green",
	},
	{
		icon: "i-lucide-history",
		title: "Scheduled Actions",
		description:
			"Automate device power management with intelligent scheduling and energy-saving policies.",
		tone: "cyan",
	},
	{
		icon: "i-lucide-smartphone",
		title: "Mobile App",
		description:
			"PWA-Based Mobile apps for iOS and Android with full feature parity and offline capabilities.",
		tone: "red",
	},
	{
		icon: "i-lucide-puzzle",
		title: "API Integration",
		description:
			"Comprehensive REST API for custom integrations with your existing infrastructure and automation tools.",
		tone: "slate",
	},
];

/** Feature grid on the features page. */
export const platformFeatures: Feature[] = [
	{
		icon: "i-lucide-zap",
		title: "Wake-on-LAN Control",
		description:
			"Power on offline systems remotely with structured workflows and fast response times.",
		tone: "amber",
	},
	{
		icon: "i-lucide-shield-check",
		title: "Secure Access",
		description:
			"Protect your environment with encrypted traffic, strict authentication, and access controls.",
		tone: "primary",
	},
	{
		icon: "i-lucide-chart-line",
		title: "Real-time Visibility",
		description: "Track status, uptime, and health signals in real time from a single dashboard.",
		tone: "green",
	},
	{
		icon: "i-lucide-history",
		title: "Scheduled Actions",
		description:
			"Automate power routines for maintenance windows, daily operations, and energy savings.",
		tone: "cyan",
	},
	{
		icon: "i-lucide-smartphone",
		title: "Mobile Ready",
		description:
			"Use a responsive interface and PWA support to manage critical tasks while on the move.",
		tone: "red",
	},
	{
		icon: "i-lucide-puzzle",
		title: "API Integration",
		description: "Connect NetIgnite to your tools with a flexible REST API built for automation.",
		tone: "slate",
	},
];

/** "How It Works" steps on the landing page. */
export const setupSteps: SetupStep[] = [
	{
		title: "Install Agent",
		description:
			"Deploy our lightweight agent on your network or use our cloud-based solution for instant setup.",
	},
	{
		title: "Discover Devices",
		description:
			"Automatically discover and catalog all network devices with their capabilities and current status.",
	},
	{
		title: "Take Control",
		description:
			"Start managing your devices remotely through our intuitive dashboard or mobile app.",
	},
];
