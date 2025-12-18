<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
	<div class="appShell">
		<header class="topBar">
			<a class="brand" href="/">blog.berkedogan.com.tr</a>
			<div class="meta">New blog every day</div>
		</header>

		<main class="content">
			<RouterView />
		</main>
	</div>
</template>

<style scoped>
.appShell {
	min-height: 100vh;
}

.topBar {
	position: sticky;
	top: 0;
	z-index: 10;
	background: color-mix(in srgb, var(--color-background) 12%, var(--color-primary) 88%);
	border-bottom: 1px solid var(--color-border);
	padding: var(--spacing-lg) var(--spacing-lg);
    color: var(--color-text-secondary);
}

.brand {
	display: block;
	text-decoration: none;
	color: var(--color-text-primary);
	font-weight: 700;
	letter-spacing: 0.02em;
}

.meta {
	margin-top: var(--spacing-xs);
	color: rgb(200, 200, 200);
	font-size: var(--font-size-sm);
}

.content {
	max-width: 900px;
	margin: 0 auto;
	padding: var(--spacing-2xl) var(--spacing-lg);
}
</style>
