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
			"Power on PCs, servers and NAS devices from anywhere. An agent in their network sends the Wake-on-LAN packet, so no port forwarding to your devices is needed.",
		tone: "amber",
	},
	{
		icon: "i-lucide-power",
		title: "Shutdown & Reboot",
		description:
			"Shut down and reboot Linux, Windows and macOS machines through the NetIgnite agent on them, or other devices over SSH with keys limited to exactly these two commands.",
		tone: "cyan",
	},
	{
		icon: "i-lucide-activity",
		title: "Live Status",
		description:
			"See which devices are online, checked every 20 seconds by IP address, TCP port, MAC address, SSH port or the agent on the device.",
		tone: "green",
	},
	{
		icon: "i-lucide-users",
		title: "Sharing & Roles",
		description:
			"Share devices with family or colleagues as viewer, operator or manager. They never get access to your agents or logins.",
		tone: "primary",
	},
	{
		icon: "i-lucide-smartphone",
		title: "Install as an App",
		description:
			"Add the dashboard to the home screen of your iPhone or Android phone as an app (PWA) and power on devices on the go.",
		tone: "red",
	},
	{
		icon: "i-lucide-puzzle",
		title: "REST API",
		description:
			"Automate with a REST API, API keys and an OpenAPI reference for your scripts and home automation.",
		tone: "slate",
	},
];

/** Feature grid on the features page. */
export const platformFeatures: Feature[] = [
	{
		icon: "i-lucide-zap",
		title: "Wake-on-LAN Control",
		description:
			"Power on devices through an ESP32 or Linux agent in their network, from the dashboard, your phone or the API.",
		tone: "amber",
	},
	{
		icon: "i-lucide-power",
		title: "Shutdown & Reboot",
		description:
			"Turn Linux, Windows and macOS machines off or restart them through the NetIgnite agent on them, which can do nothing else. Other devices work over SSH, with keys that only allow shutdown and reboot.",
		tone: "cyan",
	},
	{
		icon: "i-lucide-activity",
		title: "Live Status",
		description:
			"Status checks every 20 seconds by IPv4 or IPv6 address, TCP port, MAC address (IPv6 link-local), SSH port or the agent on the device.",
		tone: "green",
	},
	{
		icon: "i-lucide-users",
		title: "Sharing & Roles",
		description:
			"Share a device as viewer (status), operator (also power actions) or manager (also settings). Agents and SSH logins stay yours.",
		tone: "primary",
	},
	{
		icon: "i-lucide-usb",
		title: "Browser Install & Updates",
		description:
			"Install the ESP32 agent from Chrome, Edge or Firefox over USB. Over-the-air updates are checked before they're installed and roll back automatically if they fail.",
		tone: "amber",
	},
	{
		icon: "i-lucide-shield-check",
		title: "Secure by Design",
		description:
			"Each agent has its own credential, stored on the server only as a hash, and only runs fixed commands: no remote shell, no file access.",
		tone: "green",
	},
	{
		icon: "i-lucide-smartphone",
		title: "Install as an App",
		description:
			"A responsive dashboard you can install as an app (PWA) on iOS, Android and the desktop.",
		tone: "red",
	},
	{
		icon: "i-lucide-puzzle",
		title: "REST API",
		description:
			"Connect NetIgnite to your tools with a REST API, API keys and an OpenAPI reference.",
		tone: "slate",
	},
	{
		icon: "i-lucide-server",
		title: "Hosted or Self-Hosted",
		description:
			"Use the hosted app or run your own server with Docker. All of NetIgnite is open source under the AGPL-3.0.",
		tone: "primary",
	},
];

/** "How It Works" steps on the landing page. */
export const setupSteps: SetupStep[] = [
	{
		title: "Set Up an Agent",
		description:
			"Install the ESP32 agent from your browser, or the Linux agent with one command, in the network of your devices. On PCs and Macs, the agent also shuts them down.",
	},
	{
		title: "Add Your Devices",
		description:
			"Enter each device's MAC address and choose how NetIgnite checks whether it's online.",
	},
	{
		title: "Take Control",
		description:
			"Power devices on, shut them down and reboot them from the dashboard, the app on your phone or the API.",
	},
];
