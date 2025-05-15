import { defineConfig } from 'vite'

export default defineConfig({
	root: 'src', // root is now /src
	base: '/GitHubPortfolio/', // needed for GitHub Pages
	build: {
		outDir: '../dist', // go up to put dist outside of src
		emptyOutDir: true
	}
})
