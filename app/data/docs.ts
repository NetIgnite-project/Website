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
				description: "Server, agents and devices, and what happens when you press Power On.",
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
				description: "config.json, environment variables, data paths and logging.",
				icon: "i-lucide-settings",
			},
			{
				to: "/docs/server/reverse-proxy",
				title: "HTTPS & Reverse Proxy",
				description: "Serve the dashboard and the agent WebSocket over TLS.",
				icon: "i-lucide-lock",
			},
			{
				to: "/docs/server/users",
				title: "Users & Accounts",
				description: "The initial admin account, sessions, roles and passwords.",
				icon: "i-lucide-users",
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
				description: "Create agents and get the credentials they connect with.",
				icon: "i-lucide-radio-tower",
			},
			{
				to: "/docs/guides/devices",
				title: "Devices & Wake-on-LAN",
				description: "Add devices, power them on and check whether they are online.",
				icon: "i-lucide-monitor",
			},
		],
	},
	{
		label: "Agents",
		pages: [
			{
				to: "/docs/agents/esp32",
				title: "ESP32 Agent",
				description: "Configure, build and flash the ESP32 agent firmware.",
				icon: "i-lucide-cpu",
			},
			{
				to: "/docs/agents/protocol",
				title: "Agent Protocol",
				description: "The WebSocket protocol between server and agents — build your own agent.",
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
				description: "Every HTTP endpoint of the NetIgnite server.",
				icon: "i-lucide-braces",
			},
			{
				to: "/docs/reference/troubleshooting",
				title: "Troubleshooting",
				description: "Common problems with agents, wake-ups, status checks and logins.",
				icon: "i-lucide-life-buoy",
			},
			{
				to: "/docs/reference/development",
				title: "Development",
				description: "Repositories, local setup and contributing.",
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
