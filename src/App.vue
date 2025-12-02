<script setup lang="ts">
import NavBar from './components/NavBar.vue';
</script>

<template>
  <div class="app">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <NavBar />
    
    <div id="main-content" role="main" itemscope itemtype="https://schema.org/Person">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#main-content {
  flex: 1;
}

/* Skip link styles */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  z-index: 9999;
  font-weight: 600;
  transition: top var(--transition-fast);
}

.skip-link:focus {
  top: 6px;
}
</style>