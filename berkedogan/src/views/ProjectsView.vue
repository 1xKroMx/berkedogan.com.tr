<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLanguage } from '@/composables/useLanguage';

const { lang, t } = useLanguage();

interface Project {
  id: number;
  link: string;
  name: string;
  description: string;
}

const projects = computed<Project[]>(() => [
  { id: 1, link: 'https://blog.berkedogan.com.tr', name: t.value.project1Name, description: 'blog.berkedogan.com.tr' },
]);
</script>

<template>
    <main class="projects-page">
     <header class="page-header">
        <h1 class="page-title">{{ t.projectsItem }}</h1>
        <p class="page-subtitle">{{ t.projectsDescription }}</p>
     </header>

        <section>
          <a
            v-for="project in projects"
            :key="project.id"
            class="project mb-4"
            :href="project.link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>{{ project.name }}</div>
            <div class="description">{{ project.description }}</div>
          </a>
        </section>
    </main>
</template>

<style scoped>
.projects-page {
  min-height: 100vh;
  padding: var(--spacing-xl) 0;
}
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-top: 1.2rem;
  margin-bottom: var(--spacing-md);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}


.project {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  border: 2px solid transparent;
}
.project:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>