<script setup lang="ts">
import { computed, ref } from 'vue'

const markdown = ref('')
const isPublishing = ref(false)
const error = ref('')
const lastPublishedId = ref('')
const lastPublishedUrl = ref('')

const blogBaseUrl = (import.meta.env.VITE_BLOG_BASE_URL as string | undefined) || 'https://blog.berkedogan.com.tr'

const todayISO = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const publish = async () => {
  error.value = ''
  lastPublishedId.value = ''
  lastPublishedUrl.value = ''

  if (!markdown.value.trim()) {
    error.value = 'İçerik boş olamaz.'
    return
  }

  isPublishing.value = true
  try {
    const res = await fetch('https://www.berkedogan.com.tr/api/blog/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        dateISO: todayISO.value,
        markdown: markdown.value,
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.success) {
      error.value = data?.error || 'Publish başarısız.'
      return
    }

    lastPublishedId.value = String(data.id || '')
    if (lastPublishedId.value) {
      lastPublishedUrl.value = `${blogBaseUrl.replace(/\/$/, '')}/${lastPublishedId.value}`
    }
    markdown.value = ''
  } catch (e) {
    error.value = 'Sunucuya bağlanılamıyor.'
  } finally {
    isPublishing.value = false
  }
}
</script>

<template>
  <section class="page">
    <header class="header">
      <h2 class="title">Blog</h2>
      <p class="subtitle">Bugünün yazısı ({{ todayISO }})</p>
    </header>

    <textarea
      v-model="markdown"
      class="editor"
      placeholder="Markdown..."
      rows="14"
    />

    <div class="actions">
      <button class="btn" :disabled="isPublishing" @click="publish">
        {{ isPublishing ? 'Publishing…' : 'Publish' }}
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="lastPublishedId" class="ok">
      Yayınlandı. id: {{ lastPublishedId }}
      <a v-if="lastPublishedUrl" class="link" :href="lastPublishedUrl" target="_blank" rel="noreferrer">
        Blogda aç
      </a>
    </p>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: var(--spacing-lg);
}

.header {
  display: grid;
  gap: var(--spacing-xs);
}

.title {
  margin: 0;
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
}

.editor {
  width: 100%;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: 1.6;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius-md);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  margin: 0;
  color: red;
}

.ok {
  margin: 0;
  color: var(--color-text-primary);
}

.link {
  margin-left: var(--spacing-sm);
  color: var(--color-text-primary);
}
</style>
