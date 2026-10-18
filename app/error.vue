<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
	error: NuxtError;
}>();

usePageSeo({
	title: `Error ${props.error.statusCode} — NetIgnite`,
	description: "An error occurred while processing your request.",
	noindex: true,
});
</script>

<template>

    <NuxtRouteAnnouncer />

    <UApp>

        <div class="app-layout main-bg-color text-slate-100">

            <LayoutHeader />

            <UMain class="py-8 main-content">
                <UContainer>
                    <UError :error="props.error" />
                </UContainer>
            </UMain>

            <LayoutFooter />

        </div>

    </UApp>

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
