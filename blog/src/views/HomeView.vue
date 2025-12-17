<script setup lang="ts">
import { computed } from 'vue'
import BlogsbyDays from '../components/BlogsbyDays.vue'
import { posts } from '../data/posts'

const postsSorted = computed(() => {
  return [...posts].sort((a, b) => b.dateISO.localeCompare(a.dateISO))
})
</script>

<template>
  <section class="page">
    <h1 class="title">Bloğum</h1>
    <p class="subtitle">Bloğuma hoş geldiniz! Buraya ya beni tanıdığınız için, ya da şans eseri düştünüz. :)</p>

    <div class="list">
      <BlogsbyDays v-for="post in postsSorted" :key="post.id" :id="post.id" :date-iso="post.dateISO" />
    </div>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: var(--spacing-xl);
}

.title {
  margin: 0;
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
}

.list {
  display: grid;
  gap: var(--spacing-md);
}
</style>
