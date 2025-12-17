<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <nav class="side" aria-label="Panel navigation">
    <router-link
      to="/panel/tasks"
      class="link"
      :class="{ active: route.path.startsWith('/panel/tasks') }"
    >
      Tasks
    </router-link>

    <router-link
      to="/panel/blog"
      class="link"
      :class="{ active: route.path.startsWith('/panel/blog') }"
    >
      Blog
    </router-link>
  </nav>
</template>

<style scoped>
.side {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
}

.link {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: var(--color-text-primary);
  border: 1px solid transparent;
}

.link:hover {
  background: var(--color-surface-alt);
}

.link.active {
  border-color: var(--color-border);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface) 92%);
}
</style>
