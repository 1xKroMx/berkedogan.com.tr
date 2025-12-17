<script setup lang="ts">
import SideNav from '@/components/panel/SideNav.vue'
</script>

<template>
  <div class="panel">
    <header class="top" role="banner">
      <div class="topInner">
        <h1 class="title">Panel</h1>
      </div>
    </header>

    <div class="body">
      <aside class="nav">
        <SideNav />
      </aside>

      <main class="content" role="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.panel {
  display: grid;
  gap: var(--spacing-lg);
}

.top {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
}

.topInner {
  padding: var(--spacing-lg);
}

.title {
  margin: 0;
  font-size: var(--font-size-xl);
}

.body {
  display: grid;
  grid-template-columns: 220px 1fr;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  min-height: 60vh;
}

.nav {
  min-width: 0;
}

.content {
  min-width: 0;
  padding: var(--spacing-xl);
  background: var(--color-background);
}

@media (max-width: 860px) {
  .body {
    grid-template-columns: 1fr;
  }
}
</style>
