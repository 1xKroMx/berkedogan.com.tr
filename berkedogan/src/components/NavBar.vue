<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref } from 'vue';

const route = useRoute();
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="nav-container">
      <!-- Logo/Brand -->
      <div class="nav-brand">
        <router-link to="/" class="brand-link" @click="closeMenu">
          <span class="brand-text">Berke Doğan</span>
        </router-link>
      </div>

      <!-- Mobile menu button -->
      <button 
        class="mobile-menu-btn"
        :class="{ 'menu-open': isMenuOpen }"
        @click="toggleMenu"
        :aria-expanded="isMenuOpen"
        aria-controls="navigation-menu"
        aria-label="Toggle navigation menu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Navigation menu -->
      <ul 
        class="nav-menu" 
        :class="{ 'menu-open': isMenuOpen }"
        id="navigation-menu"
      >
        <li class="nav-item">
          <router-link 
            to="/" 
            class="nav-link"
            :class="{ active: route.path === '/' }"
            @click="closeMenu"
          >
            Home
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/about" 
            class="nav-link"
            :class="{ active: route.path === '/about' }"
            @click="closeMenu"
          >
            About Me
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/contact" 
            class="nav-link"
            :class="{ active: route.path === '/contact' }"
            @click="closeMenu"
          >
            Contact
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/projects" 
            class="nav-link"
            :class="{ active: route.path === '/projects' }"
            @click="closeMenu"
          >
            Projects
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>
<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
  z-index: 1000;
  box-shadow: var(--shadow-sm);
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

/* Brand/Logo */
.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  text-decoration: none;
  color: var(--color-text-primary);
  transition: color var(--transition-fast);
}

.brand-link:hover {
  color: var(--color-primary);
}

.brand-text {
  font-size: var(--font-size-lg);
  font-weight: 700;
  letter-spacing: -0.025em;
}

/* Mobile menu button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-fast);
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background-color: var(--color-text-primary);
  transition: all var(--transition-fast);
  transform-origin: center;
}

.mobile-menu-btn.menu-open .hamburger-line:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.mobile-menu-btn.menu-open .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.menu-open .hamburger-line:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Navigation menu */
.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-item {
  position: relative;
}

.nav-link {
  display: block;
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary);
  background-color: var(--color-surface-alt);
}

.nav-link.active {
  color: var(--color-primary);
  background-color: rgba(112, 138, 88, 0.1);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: var(--color-primary);
  border-radius: 1px;
}

/* Mobile styles */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: var(--spacing-md);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-base);
  }

  .nav-menu.menu-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-item {
    width: 100%;
  }

  .nav-link {
    padding: var(--spacing-md);
    text-align: center;
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-xs);
  }

  .nav-link.active::after {
    display: none;
  }

  .nav-link.active {
    background-color: var(--color-primary);
    color: white;
  }
}

/* Tablet styles */
@media (max-width: 1024px) and (min-width: 769px) {
  .nav-container {
    padding: 0 var(--spacing-lg);
  }
  
  .nav-menu {
    gap: var(--spacing-md);
  }
}
</style>