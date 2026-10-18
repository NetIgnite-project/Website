<template>
	<div class="app-layout main-bg-color text-slate-100">
		<LayoutHeader />

		<UMain class="main-content">
			<slot />
		</UMain>

		<LayoutFooter />
	</div>
</template>

<style scoped>
.app-layout {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.main-content {
	flex: 1;
}
</style>
