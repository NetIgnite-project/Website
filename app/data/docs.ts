/**
 * Static docs navigation — consumed by the docs sidebar and prev/next links.
 * Follows the style-guide "static data in app/data/" idiom.
 */

export interface DocsPage {
	/** Absolute page path, also the route. */
	to: string;
	title: string;
	description: string;
	icon: string;
}

export interface DocsSection {
	label: string;
	pages: DocsPage[];
}

export const docsSections: DocsSection[] = [
	{
		label: "Introduction",
		pages: [
			{
				to: "/docs",
				title: "Overview",
				description: "What NetIgnite is, its components, and where to go next.",
				icon: "i-lucide-book-open",
			},
			{
				to: "/docs/how-it-works",
				title: "How It Works",
				description: "Server, agents and devices, and what happens when you power on a device.",
				icon: "i-lucide-workflow",
			},
			{
				to: "/docs/getting-started",
				title: "Getting Started",
				description: "From an empty server to your first remote wake-up.",
				icon: "i-lucide-rocket",
			},
		],
	},
	{
		label: "Self-Hosting",
		pages: [
			{
				to: "/docs/server/installation",
				title: "Installation",
				description: "Run the NetIgnite server with Docker or from source.",
				icon: "i-lucide-container",
			},
			{
				to: "/docs/server/configuration",
				title: "Configuration",
				description: "NETIGNITE_* environment variables, server settings, data paths and logging.",
				icon: "i-lucide-settings",
			},
			{
				to: "/docs/server/reverse-proxy",
				title: "HTTPS & Reverse Proxy",
				description: "Serve the dashboard, the API and the WebSockets over TLS.",
				icon: "i-lucide-lock",
			},
			{
				to: "/docs/server/users",
				title: "Users & Accounts",
				description: "The first admin, user management, sign-up, logins and API keys.",
				icon: "i-lucide-users",
			},
			{
				to: "/docs/server/upgrading",
				title: "Upgrading from v1",
				description: "Import your v1 data into v2 and set your agents up again.",
				icon: "i-lucide-history",
			},
		],
	},
	{
		label: "Using NetIgnite",
		pages: [
			{
				to: "/docs/guides/dashboard",
				title: "Dashboard",
				description: "Find your way around the NetIgnite web app.",
				icon: "i-lucide-layout-dashboard",
			},
			{
				to: "/docs/guides/agents",
				title: "Managing Agents",
				description: "Set up agents, use the ESP32 console and update the firmware.",
				icon: "i-lucide-radio-tower",
			},
			{
				to: "/docs/guides/devices",
				title: "Devices",
				description: "Add devices, check their status, power them on and shut them down.",
				icon: "i-lucide-monitor",
			},
			{
				to: "/docs/guides/sharing",
				title: "Sharing",
				description: "Share devices with other users as viewer, operator or manager.",
				icon: "i-lucide-share-2",
			},
			{
				to: "/docs/guides/ssh",
				title: "SSH",
				description: "Shut down and reboot devices that can't run the agent, over SSH with the agent's keys.",
				icon: "i-lucide-key-square",
			},
		],
	},
	{
		label: "Agents",
		pages: [
			{
				to: "/docs/agents/esp32",
				title: "ESP32 Agent",
				description: "Web installer, serial console, updates and building the firmware.",
				icon: "i-lucide-cpu",
			},
			{
				to: "/docs/agents/linux",
				title: "Linux Agent",
				description: "Install, pair, host mode and Wake-on-LAN mode of the Linux agent.",
				icon: "i-lucide-terminal",
			},
			{
				to: "/docs/agents/windows",
				title: "Windows Agent",
				description: "Shut down and restart a Windows PC: install the agent with one PowerShell command.",
				icon: "i-lucide-monitor",
			},
			{
				to: "/docs/agents/macos",
				title: "macOS Agent",
				description: "Shut down and restart a Mac: install the agent with one command.",
				icon: "i-lucide-laptop",
			},
			{
				to: "/docs/agents/protocol",
				title: "Agent Protocol",
				description: "The WebSocket protocol v2 between server and agents — build your own agent.",
				icon: "i-lucide-cable",
			},
		],
	},
	{
		label: "Reference",
		pages: [
			{
				to: "/docs/reference/api",
				title: "REST API",
				description: "Authentication, API keys and the endpoints of the NetIgnite server.",
				icon: "i-lucide-braces",
			},
			{
				to: "/docs/reference/troubleshooting",
				title: "Troubleshooting",
				description: "Common problems with logins, agents, wake-ups, status checks and updates.",
				icon: "i-lucide-life-buoy",
			},
			{
				to: "/docs/reference/development",
				title: "Development",
				description: "Repositories, branches, local setup, tests and contributing.",
				icon: "i-lucide-code",
			},
		],
	},
];

/**
 * Base URL for "Edit this page" links, ending in the content folder, e.g.
 * "https://github.com/<org>/<repo>/edit/main/content" or
 * "https://git.leicraftmc.de/<group>/<repo>/-/edit/main/content". `null` hides the link.
 */
export const docsEditBaseUrl: string | null =
	"https://github.com/NetIgnite-project/Website/edit/main/content";

/** Flat list of pages in reading order, for prev/next navigation. */
export const docsPagesFlat: DocsPage[] = docsSections.flatMap((section) => section.pages);

export function getDocsPageByPath(path: string): DocsPage | undefined {
	return docsPagesFlat.find((page) => page.to === path);
}
