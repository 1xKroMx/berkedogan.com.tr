import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import ContactView from '@/views/ContactView.vue'
import TasksView from '@/views/TasksView.vue'
import PanelLayout from '@/layouts/PanelLayout.vue'
import BlogEditorView from '@/views/BlogEditorView.vue'

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
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
      meta: {
        title: 'Projects — Berke Doğan',
      }
    },
    {
      path: '/panel',
      component: PanelLayout,
      meta: {
        requiresAuth: true,
        title: 'Panel — Berke Doğan',
      },
      children: [
        {
          path: 'tasks',
          name: 'PanelTasks',
          component: TasksView,
          meta: {
            title: 'Tasks — Berke Doğan',
            description: 'My private task management app built with Vue 3 and TypeScript.',
          },
        },
        {
          path: 'blog',
          name: 'PanelBlog',
          component: BlogEditorView,
          meta: {
            title: 'Blog Editor — Berke Doğan',
          },
        },
      ],
    },
    {
      // Backward compatible entrypoint for old links & PasswordModal redirect
      path: '/tasks',
      redirect: '/panel/tasks',
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    // Dev/localhost bypass: allow access during local development without auth
    // This only triggers when running a dev build and accessing via localhost.
    const isDevBuild = import.meta.env.DEV === true;
    const bypassEnabled = Boolean(import.meta.env.VITE_AUTH_BYPASS);
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';

    if (isDevBuild && bypassEnabled && isLocalHost) {
      console.log(`[Router] Dev/localhost detected, bypassing auth for ${to.path}`);
      next();
      return;
    }

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
