<template>
    <footer class="footer">
        <div class="container-fluid footer-legal">
            <p class="legal-paragraph">
                <span class="copyright-text">&copy; {{ new Date().getFullYear() }} LeiCraft_MC. Alle Rechte vorbehalten</span><br>
                <a class="legal-text" href="https://client.leicraftmc.de/impressum/">Impressum</a> |
                <a class="legal-text" href="https://client.leicraftmc.de/datenschutz/">Datenschutz</a>
            </p>
        </div>
    </footer>
</template>

<style scoped>

.footer {
    margin-top: 50px;
    margin-bottom: 0;
}
.footer-legal {
    background-color: #1a1b2e;
	text-align: center;
}

.legal-paragraph {
	padding-top: 8px;
    padding-bottom: 8px;
    margin-bottom: 0;
}

.copyright-text {
    background-color: #1a1b2e;
}

.legal-text {
	text-decoration: none;
	color: rgb(255, 254, 255, 0.75);
}

</style>