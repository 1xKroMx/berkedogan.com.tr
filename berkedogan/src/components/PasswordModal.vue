<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const password = ref('')
const error = ref('')
const authMode = ref(false)

async function handlePasswordSubmit() {
  try {
      const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password: password.value })
    });

    if (!res.ok) {
      error.value = "Yanlış şifre"
      return
    }

    authMode.value = false
    router.push("/tasks")

  } catch {
    error.value = "Sunucuya bağlanılamıyor"
  }
}
</script>

<template>
    <div class="auth-panel">
      <input type="password" v-model="password" placeholder="Şifre" @keyup.enter="handlePasswordSubmit()" />
    </div>


    <p v-if="error" class="error-message">{{ error }}</p>
</template>

<style scoped>

.auth-panel {
  margin-top: 2rem;
  margin-bottom: 1rem;
  position: static;
  margin-left: auto;
  margin-right: auto;
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: fit-content;
  background-color: var(--color-background-secondary);
}

.auth-panel input {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  width: fit-content;
}

.error-message {
  color: red;
  text-align: center;
  margin-bottom: 2rem;
}
</style>