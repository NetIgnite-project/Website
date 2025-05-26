

<script setup lang="ts">

import { NuxtLink } from '#components';
import Logo from '@/components/img/logo-white.vue';

</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top netignite-nav" data-bs-theme="dark">
        <div class="container">
            <NuxtLink class="navbar-brand" to="/">
                <Logo class="logo" style="height: 50px;" />
            </NuxtLink>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse flex-lg-grow-0" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <NuxtLink class="nav-link" to="/">Home</NuxtLink>
                    </li>
                    <li class="nav-item">
                        <NuxtLink class="nav-link" to="/about">About</NuxtLink>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link external-link" href="https://github.com/NetIgnite-project/" target="_blank">Github</a>
                    </li>
                </ul>
                <div class="">
                    <a role="button" class="btn btn-primary" href="https://app.netignite.dev/" target="_blank">Login</a>
                </div>
            </div> 
        </div>
    </nav>
</template>

<style scoped>

.netignite-nav {
    background-color: #1a1b2e !important;
    font-weight: 500;
}

a.external-link::after {
    content: "↗";
    font-size: 0.8em; 
    margin-left: 0.3em; 
    display: inline-block;
    color: inherit;
    text-decoration: none;
}

.nav-link {
    font-size: calc(1.275rem + .1vw);
}

.router-link-active {
    color: #0d6efd !important;
}

.btn-primary {
    background-color: #0d6efd !important;
    border-color: #0d6efd !important;
    font-size: calc(1.275rem + .1vw);
    font-weight: 500;
}


</style>
