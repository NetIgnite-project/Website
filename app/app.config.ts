import { codeIcons } from "./data/code-icons";

export default defineAppConfig({
	ui: {
		colors: {
			// NetIgnite blue (#0087ff), defined in main.css.
			primary: "netignite",
			neutral: "slate",
		},
		prose: {
			codeIcon: codeIcons,
		},
	},
	theme: {
		radius: 0.5,
		blackAsPrimary: false,
	},
});
