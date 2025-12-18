<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
	id: string
	dateIso: string
}>()

const prettyDate = computed(() => {
	const [y, m, d] = props.dateIso.split('-').map((x) => Number(x))
	if (!y || !m || !d) return props.dateIso

	const date = new Date(Date.UTC(y, m - 1, d))
	return new Intl.DateTimeFormat('tr-TR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(date)
})
</script>

<template>
	<RouterLink class="dayCard" :to="`/${id}`">
		<div class="dayText">{{ prettyDate }}</div>
		<div class="hint">Click to open</div>
	</RouterLink>
</template>

<style scoped>
.dayCard {
	display: grid;
	gap: var(--spacing-xs);
	padding: var(--spacing-lg);
	border-radius: var(--border-radius-xl);
	border: 1px solid var(--color-border);
	background: var(--color-surface);
	box-shadow: var(--shadow-sm);
	color: inherit;
	text-decoration: none;
}

.dayCard:hover {
	border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
	box-shadow: var(--shadow-md);
}

.dayText {
	font-weight: 700;
	font-size: var(--font-size-xl);
	letter-spacing: 0.01em;
}

.hint {
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
}
</style>