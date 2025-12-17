<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { posts } from '../data/posts'

const route = useRoute()

const id = computed(() => String(route.params.id || ''))

const post = computed(() => {
  return posts.find((p) => p.id === id.value)
})

const prettyDate = computed(() => {
  if (!post.value) return ''
  const [y, m, d] = post.value.dateISO.split('-').map((x) => Number(x))
  if (!y || !m || !d) return post.value.dateISO

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
  <section class="page">
    <RouterLink class="back" to="/">← Geri</RouterLink>

    <div v-if="!post" class="missing">
      <h1 class="missingTitle">Yazı bulunamadı</h1>
      <p class="missingText">Uups. Yanlış geldin galiba. Bu id için veri yok.</p>
    </div>

    <article v-else class="post">
      <header class="header">
        <h1 class="date">{{ prettyDate }}</h1>
      </header>

      <div class="body">{{ post.content }}</div>
    </article>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: var(--spacing-xl);
}

.back {
  width: fit-content;
  color: var(--color-text-primary);
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.back:hover {
  border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
}

.post {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-background) 70%, white 30%);
}

.date {
  margin: 0;
}

.body {
  padding: var(--spacing-xl);
  white-space: pre-wrap;
}

.missing {
  padding: var(--spacing-2xl);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius-xl);
  background: color-mix(in srgb, var(--color-background) 70%, white 30%);
}

.missingTitle {
  margin: 0;
}

.missingText {
  margin: var(--spacing-sm) 0 0 0;
  color: var(--color-text-secondary);
}
</style>
