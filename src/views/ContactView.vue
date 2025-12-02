<script setup lang="ts">
</script>

<template>
  <main class="contact-page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">Contact Me</h1>
        <p class="page-subtitle">
          Let's connect! I'm always excited to discuss new projects and opportunities.
        </p>
      </header>

      <div class="contact-content">
        <section class="contact-info">
          <div class="info-card">
            <h2 class="section-title">Get In Touch</h2>
            <p class="contact-description">
              I'm currently available for freelance work and open to discussing new projects. 
              Whether you have a question about my work or want to collaborate, I'd love to hear from you.
            </p>
            
            <div class="contact-details">
              <div class="detail-item">
                <div class="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div class="detail-content">
                  <h3 class="detail-title">Location</h3>
                  <p class="detail-text">Turkey</p>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div class="detail-content">
                  <h3 class="detail-title">Email</h3>
                  <p class="detail-text">doganberke95@gmail.com</p>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <div class="detail-content">
                  <h3 class="detail-title">Response Time</h3>
                  <p class="detail-text">Usually within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="contact-methods">
          <h2 class="section-title">Connect With Me</h2>
          <div class="contact-grid">
            <a 
              href="mailto:doganberke95@gmail.com" 
              class="contact-card email-card"
              aria-label="Send me an email"
            >
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div class="card-content">
                <h3 class="card-title">Email</h3>
                <p class="card-description">Send me a message directly</p>
                <span class="card-link">doganberke95@gmail.com</span>
              </div>
            </a>

            <a 
              href="https://www.linkedin.com/in/berke-doğan-972292359" 
              target="_blank" 
              rel="noopener noreferrer"
              class="contact-card linkedin-card"
              aria-label="Visit my LinkedIn profile"
            >
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div class="card-content">
                <h3 class="card-title">LinkedIn</h3>
                <p class="card-description">Let's connect professionally</p>
                <span class="card-link">View Profile</span>
              </div>
            </a>

            <a 
              href="https://github.com/1xKroMx" 
              target="_blank" 
              rel="noopener noreferrer"
              class="contact-card github-card"
              aria-label="Visit my GitHub profile"
            >
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div class="card-content">
                <h3 class="card-title">GitHub</h3>
                <p class="card-description">Check out my code</p>
                <span class="card-link">View Repository</span>
              </div>
            </a>
          </div>

          <div class="contact-footer">
            <p class="footer-text">
              <span class="emoji">✨</span>
              If you have any questions or project ideas, feel free to reach out. I'm always excited to collaborate!
            </p>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
<style scoped>
.contact-page {
  min-height: 100vh;
  padding: var(--spacing-xl) 0;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* Contact Content */
.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3xl);
  align-items: start;
}

/* Contact Info Section */
.contact-info {
  animation: fadeInLeft 0.8s ease-out;
}

.info-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  height: fit-content;
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.contact-description {
  font-size: var(--font-size-lg);
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.detail-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.detail-icon svg {
  width: 24px;
  height: 24px;
}

.detail-content {
  flex: 1;
}

.detail-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.detail-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Contact Methods Section */
.contact-methods {
  animation: fadeInRight 0.8s ease-out 0.2s both;
}

.contact-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  border: 2px solid transparent;
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.contact-card:focus {
  outline: none;
  border-color: var(--color-secondary);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-base);
}

.card-icon svg {
  width: 28px;
  height: 28px;
}

.email-card .card-icon {
  background: #EA4335;
  color: white;
}

.linkedin-card .card-icon {
  background: #0077B5;
  color: white;
}

.github-card .card-icon {
  background: #333;
  color: white;
}

.contact-card:hover .card-icon {
  transform: scale(1.1);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.card-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.card-link {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.card-link::after {
  content: '→';
  transition: transform var(--transition-fast);
}

.contact-card:hover .card-link::after {
  transform: translateX(4px);
}

/* Contact Footer */
.contact-footer {
  background: var(--color-surface-alt);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
}

.footer-text {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.emoji {
  font-size: var(--font-size-xl);
}

/* Animations */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .section-title {
    font-size: var(--font-size-xl);
  }

  .contact-description {
    font-size: var(--font-size-base);
  }

  .contact-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }

  .card-icon {
    width: 64px;
    height: 64px;
  }

  .card-icon svg {
    width: 32px;
    height: 32px;
  }

  .footer-text {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .contact-page {
    padding: var(--spacing-lg) 0;
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .info-card,
  .contact-card,
  .contact-footer {
    padding: var(--spacing-lg);
  }

  .detail-item {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }

  .detail-icon {
    width: 40px;
    height: 40px;
  }

  .detail-icon svg {
    width: 20px;
    height: 20px;
  }
}
</style>