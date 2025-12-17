<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const markdown = ref('')
const isPublishing = ref(false)
const error = ref('')
const errorDetails = ref('')
const lastPublishedId = ref('')
const lastPublishedUrl = ref('')

type Entry = {
  id: string
  dateISO: string
}

const entries = ref<Entry[]>([])
const selectedId = ref('')
const selectedDateISO = ref('')
const isLoadingEntries = ref(false)
const isLoadingEntry = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)

const blogBaseUrl = (import.meta.env.VITE_BLOG_BASE_URL as string | undefined) || 'https://blog.berkedogan.com.tr'

const prettySelectedDate = computed(() => {
  const iso = selectedDateISO.value
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map((x) => Number(x))
  if (!y || !m || !d) return iso
  const date = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
})

const loadEntries = async () => {
  isLoadingEntries.value = true
  try {
    const res = await fetch('https://www.berkedogan.com.tr/api/blog/entries', {
      credentials: 'include',
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.success) {
      error.value = data?.error || `Liste alınamadı. (HTTP ${res.status})`
      if (data?.details) errorDetails.value = typeof data.details === 'string' ? data.details : JSON.stringify(data.details)
      return
    }

    entries.value = Array.isArray(data.entries)
      ? data.entries.map((e: any) => ({ id: String(e.id), dateISO: String(e.dateISO) }))
      : []

    if (!selectedId.value && entries.value.length > 0) {
      selectedId.value = entries.value[0].id
      selectedDateISO.value = entries.value[0].dateISO
      await loadEntry(selectedId.value)
    }
  } catch {
    error.value = 'Sunucuya bağlanılamıyor.'
  } finally {
    isLoadingEntries.value = false
  }
}

const loadEntry = async (id: string) => {
  if (!id) return
  isLoadingEntry.value = true
  try {
    const url = new URL('https://www.berkedogan.com.tr/api/blog/get')
    url.searchParams.set('id', id)
    const res = await fetch(url.toString(), { credentials: 'include' })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.success) {
      error.value = data?.error || `Yazı alınamadı. (HTTP ${res.status})`
      if (data?.details) errorDetails.value = typeof data.details === 'string' ? data.details : JSON.stringify(data.details)
      return
    }

    selectedId.value = String(data.id || id)
    selectedDateISO.value = String(data.dateISO || '')
    markdown.value = String(data.markdown || '')
    lastPublishedId.value = selectedId.value
    lastPublishedUrl.value = `${blogBaseUrl.replace(/\/$/, '')}/${selectedId.value}`
  } catch {
    error.value = 'Sunucuya bağlanılamıyor.'
  } finally {
    isLoadingEntry.value = false
  }
}

const startNew = () => {
  selectedId.value = ''
  selectedDateISO.value = todayISO.value
  markdown.value = ''
  lastPublishedId.value = ''
  lastPublishedUrl.value = ''
  error.value = ''
  errorDetails.value = ''
}

const todayISO = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const publish = async () => {
  error.value = ''
  errorDetails.value = ''
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

    const rawText = await res.text().catch(() => '')
    const data = rawText ? (() => {
      try {
        return JSON.parse(rawText)
      } catch {
        return null
      }
    })() : null

    if (!res.ok || !data?.success) {
      error.value = data?.error || `Publish başarısız. (HTTP ${res.status})`
      if (data?.details) errorDetails.value = typeof data.details === 'string' ? data.details : JSON.stringify(data.details)
      else if (rawText && !data) errorDetails.value = rawText
      return
    }

    lastPublishedId.value = String(data.id || '')
    if (lastPublishedId.value) {
      lastPublishedUrl.value = `${blogBaseUrl.replace(/\/$/, '')}/${lastPublishedId.value}`
    }
    markdown.value = ''
    await loadEntries()
  } catch (e) {
    error.value = 'Sunucuya bağlanılamıyor.'
  } finally {
    isPublishing.value = false
  }
}

const update = async () => {
  error.value = ''
  errorDetails.value = ''

  if (!selectedId.value) {
    error.value = 'Önce bir yazı seç.'
    return
  }
  if (!markdown.value.trim()) {
    error.value = 'İçerik boş olamaz.'
    return
  }

  isUpdating.value = true
  try {
    const res = await fetch('https://www.berkedogan.com.tr/api/blog/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: selectedId.value, markdown: markdown.value }),
    })

    const rawText = await res.text().catch(() => '')
    const data = rawText
      ? (() => {
          try {
            return JSON.parse(rawText)
          } catch {
            return null
          }
        })()
      : null

    if (!res.ok || !data?.success) {
      error.value = data?.error || `Update başarısız. (HTTP ${res.status})`
      if (data?.details) errorDetails.value = typeof data.details === 'string' ? data.details : JSON.stringify(data.details)
      else if (rawText && !data) errorDetails.value = rawText
      return
    }

    lastPublishedId.value = selectedId.value
    lastPublishedUrl.value = `${blogBaseUrl.replace(/\/$/, '')}/${selectedId.value}`
    await loadEntries()
  } catch {
    error.value = 'Sunucuya bağlanılamıyor.'
  } finally {
    isUpdating.value = false
  }
}

const del = async () => {
  error.value = ''
  errorDetails.value = ''

  if (!selectedId.value) {
    error.value = 'Önce bir yazı seç.'
    return
  }

  const ok = window.confirm('Bu yazıyı silmek istiyor musun?')
  if (!ok) return

  isDeleting.value = true
  try {
    const res = await fetch('https://www.berkedogan.com.tr/api/blog/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: selectedId.value }),
    })

    const rawText = await res.text().catch(() => '')
    const data = rawText
      ? (() => {
          try {
            return JSON.parse(rawText)
          } catch {
            return null
          }
        })()
      : null

    if (!res.ok || !data?.success) {
      error.value = data?.error || `Delete başarısız. (HTTP ${res.status})`
      if (data?.details) errorDetails.value = typeof data.details === 'string' ? data.details : JSON.stringify(data.details)
      else if (rawText && !data) errorDetails.value = rawText
      return
    }

    startNew()
    await loadEntries()
  } catch {
    error.value = 'Sunucuya bağlanılamıyor.'
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  await loadEntries()
})
</script>

<template>
  <section class="page">
    <header class="header">
      <h2 class="title">Blog</h2>
      <p class="subtitle">
        <span v-if="selectedId">Seçili: {{ prettySelectedDate }} — {{ selectedId.slice(0, 8) }}</span>
        <span v-else>Yeni yazı ({{ todayISO }})</span>
      </p>
    </header>

    <div class="row">
      <select
        class="select"
        :disabled="isLoadingEntries || entries.length === 0"
        v-model="selectedId"
        @change="() => {
          const e = entries.find(x => x.id === selectedId)
          selectedDateISO = e?.dateISO || ''
          loadEntry(selectedId)
        }"
      >
        <option value="">Yeni…</option>
        <option v-for="e in entries" :key="e.id" :value="e.id">
          {{ e.dateISO }} — {{ e.id.slice(0, 8) }}
        </option>
      </select>

      <button class="btnSecondary" type="button" @click="startNew">New</button>
    </div>

    <textarea
      v-model="markdown"
      class="editor"
      placeholder="Markdown..."
      rows="14"
    />

    <div class="actions">
      <button class="btnSecondary" :disabled="!selectedId || isLoadingEntry || isUpdating" @click="update">
        {{ isUpdating ? 'Saving…' : 'Save' }}
      </button>

      <button class="btnDanger" :disabled="!selectedId || isLoadingEntry || isDeleting" @click="del">
        {{ isDeleting ? 'Deleting…' : 'Delete' }}
      </button>

      <button class="btn" :disabled="isPublishing || Boolean(selectedId)" @click="publish">
        {{ isPublishing ? 'Publishing…' : 'Publish (New)' }}
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="errorDetails" class="errorDetails">{{ errorDetails }}</p>
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

.row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.select {
  flex: 1;
  padding: 8px 12px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius-md);
  cursor: pointer;
}

.btnSecondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  padding: 8px 16px;
  border-radius: var(--border-radius-md);
  cursor: pointer;
}

.btnDanger {
  background: #dc3545;
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

.btnSecondary:disabled,
.btnDanger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  margin: 0;
  color: red;
}

.errorDetails {
  margin: 0;
  color: red;
  opacity: 0.85;
  white-space: pre-wrap;
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
