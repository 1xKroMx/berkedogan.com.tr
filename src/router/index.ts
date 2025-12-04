import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import ContactView from '@/views/ContactView.vue'
import TasksView from '@/views/TasksView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Berke Doğan — Full‑Stack Web Developer',
        description:
          'Portfolio of Berke Doğan, a full‑stack web developer crafting interactive, performant, and accessible web apps with Vue, TypeScript, and modern tooling.'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: {
        title: 'About — Berke Doğan',
        description:
          'Learn about Berke Doğan’s background, values, and the technologies he uses to build delightful user experiences.'
      }
    },
    {
      path: '/contact',
      name: 'Contact',
      component: ContactView,
      meta: {
        title: 'Contact — Berke Doğan',
        description:
          'Get in touch with Berke Doğan for freelance work, collaborations, or general inquiries. Usually replies within 24 hours.'
      }
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: TasksView,
      meta: {
        title: 'Tasks — Berke Doğan',
        description:
          'My private task management app built with Vue 3 and TypeScript.',
        requiresAuth: true
      }
    }
  ],
})

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    console.log(`[Router] Navigating to protected route: ${to.path}`);
    try {
      // Silent session check via /api/refresh endpoint
      const refreshRes = await fetch("https://www.berkedogan.com.tr/api/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        console.log(`[Router] Session valid, proceeding to ${to.path}`);
        next();
      } else {
        console.log(`[Router] Session invalid, redirecting to home`);
        next('/');
      }
    } catch (err) {
      console.error(`[Router] Session check failed:`, err);
      next('/');
    }
  } else {
    next();
  }
})

export default router
