<script setup lang="ts">
import { ref } from 'vue';
import { useLanguage } from '@/composables/useLanguage';

const { t, lang } = useLanguage();
</script>

<template>
  <main class="about-page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">{{ t.aboutItem }}</h1>
        <p class="page-subtitle">{{ t.aboutMeSubtitle }}</p>
        <blockquote v-if="lang === 'en'" class="page-motto">"What love builds, hate destroys; nothing is fixed, everything is earned."</blockquote>
      </header>

      <section class="intro-section">
        <div class="intro-content">
          <div class="intro-text">
            <h2 class="section-title">{{ t.aboutMeSectionTitle }}</h2>
            <p class="intro-description">
              {{ t.aboutMeDescription }}
            </p>
            <p class="intro-description">
              {{ t.aboutMeIntroDescription }}
            </p>
          </div>
          <div class="intro-visual">
            <div class="profile-card">
              <div class="profile-avatar">
                <div class="avatar-placeholder">
                  <span class="avatar-initials">BD</span>
                </div>
              </div>
              <div class="profile-info">
                <h3 class="profile-name">Berke Doğan</h3>
                <p class="profile-role">{{ t.heroSubtitle }}</p>
                <div class="profile-stats">
                  <div class="stat">
                    <span class="stat-number">5+</span>
                    <span class="stat-label">{{ t.profileStat1}}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">∞</span>
                    <span class="stat-label">{{ t.profileStat2 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="skills-section">
        <h2 class="section-title text-center">{{ t.aboutMeSkillsSecTitle }}</h2>
        <p class="section-description text-center">
          {{ t.aboutMeSkillsSecDescription }}
        </p>
        
        <div class="skills-grid">
          <div class="skill-category">
            <h3 class="category-title">Frontend</h3>
            <div class="skills-list">
              <div class="skill-item" v-for="skill in frontendSkills" :key="skill.name">
                <div class="skill-icon" v-html="skill.icon"></div>
                <div class="skill-info">
                  <span class="skill-name">{{ skill.name }}</span>
                  <div class="skill-level">
                    <div class="skill-bar">
                      <div class="skill-progress" :style="{ width: skill.level + '%' }"></div>
                    </div>
                    <span class="skill-percentage">{{ skill.level }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="skill-category">
            <h3 class="category-title">{{ t.otherSkillsCategory }}</h3>
            <div class="skills-list">
              <div class="skill-item" v-for="skill in otherSkills" :key="skill.name">
                <div class="skill-icon" v-html="skill.icon"></div>
                <div class="skill-info">
                  <span class="skill-name">{{ skill.name }}</span>
                  <div class="skill-level">
                    <div class="skill-bar">
                      <div class="skill-progress" :style="{ width: skill.level + '%' }"></div>
                    </div>
                    <span class="skill-percentage">{{ skill.level }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="values-section">
        <h2 class="section-title text-center">{{ t.aboutMeSec2Title }}</h2>
        <div class="values-grid">
          <div class="value-item">
            <div class="value-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="value-title">{{ t.aboutMeValue1 }}</h3>
            <p class="value-description">
              {{ t.aboutMeValue1Description }}
            </p>
          </div>
          <div class="value-item">
            <div class="value-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h3 class="value-title">{{ t.aboutMeValue2 }}</h3>
            <p class="value-description">
              {{ t.aboutMeValue2Description }}
            </p>
          </div>
          <div class="value-item">
            <div class="value-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <h3 class="value-title">{{ t.aboutMeValue3 }}</h3>
            <p class="value-description">
              {{ t.aboutMeValue3Description }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script lang="ts">
export default {
  data() {
    return {
      frontendSkills: [
        {
          name: 'HTML',
          level: 85,
          icon: `<svg viewBox="0 0 128 128">
            <path fill="#E44D26" d="M19.037 113.876L9.032 1.661h109.936l-10.016 112.198-45.019 12.48z"></path>
            <path fill="#F16529" d="M64 116.8l36.378-10.086 8.559-95.878H64z"></path>
            <path fill="#EBEBEB" d="M64 52.455H45.788L44.53 38.361H64V24.599H29.489l.33 3.692 3.382 37.927H64zm0 35.743l-.061.017-15.327-4.14-.979-10.975H33.816l1.928 21.609 28.193 7.826.063-.017z"></path>
            <path fill="#fff" d="M63.952 52.455v13.763h16.947l-1.597 17.849-15.35 4.143v14.319l28.215-7.82.207-2.325 3.234-36.233.335-3.696h-3.708zm0-27.856v13.762h33.244l.276-3.092.628-6.978.329-3.692z"></path>
          </svg>`
        },
        {
          name: 'CSS',
          level: 70,
          icon: `<svg viewBox="0 0 128 128">
            <path fill="#1572B6" d="M18.814 114.123L8.76 1.352h110.48l-10.064 112.754-45.243 12.543-45.119-12.526z"></path>
            <path fill="#33A9DC" d="M64.001 117.062l36.559-10.136 8.601-96.354h-45.16v106.49z"></path>
            <path fill="#fff" d="M64.001 51.429h18.302l1.264-14.163H64.001V23.435h34.682l-.332 3.711-3.4 38.114h-30.95V51.429z"></path>
            <path fill="#EBEBEB" d="M64.083 87.349l-.061.018-15.403-4.159-.985-11.031H33.752l1.937 21.717 28.331 7.863.063-.018v-14.39z"></path>
            <path fill="#fff" d="M81.127 64.675l-1.666 18.522-15.426 4.164v14.39l28.354-7.858.208-2.337 2.406-26.881H81.127z"></path>
            <path fill="#EBEBEB" d="M64.048 23.435v13.831H30.64l-.277-3.108-.63-7.012-.331-3.711h34.646zm-.047 27.996v13.831H48.792l-.277-3.108-.631-7.012-.33-3.711h16.447z"></path>
          </svg>`
        },
        {
          name: 'JavaScript',
          level: 50,
          icon: `<svg viewBox="0 0 128 128">
            <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z"></path>
            <path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"></path>
          </svg>`
        },
        {
          name: 'TypeScript',
          level: 10,
          icon: `<svg viewBox="0 0 128 128">
            <path fill="#fff" d="M22.67 47h99.67v73.67H22.67z"></path>
            <path data-name="original" fill="#007acc" d="M1.5 63.91v62.5h125v-125H1.5zm100.73-5a15.56 15.56 0 017.82 4.5 20.58 20.58 0 013 4c0 .16-5.4 3.81-8.69 5.85-.12.08-.6-.44-1.13-1.23a7.09 7.09 0 00-5.87-3.53c-3.79-.26-6.23 1.73-6.21 5a4.58 4.58 0 00.54 2.34c.83 1.73 2.38 2.76 7.24 4.86 8.95 3.85 12.78 6.39 15.16 10 2.66 4 3.25 10.46 1.45 15.24-2 5.2-6.9 8.73-13.83 9.9a38.32 38.32 0 01-9.52-.1 23 23 0 01-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.34 9.34 0 011.15-.73L82 101l3.59-2.08.75 1.11a16.78 16.78 0 004.74 4.54c4 2.1 9.46 1.81 12.16-.62a5.43 5.43 0 00.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48 16.48 0 01-3.43-6.25 25 25 0 01-.22-8c1.33-6.23 6-10.58 12.82-11.87a31.66 31.66 0 019.49.26zm-29.34 5.24v5.12H56.66v46.23H45.15V69.26H28.88v-5a49.19 49.19 0 01.12-5.17C29.08 59 39 59 51 59h21.83z"></path>
          </svg>`
        },
        {
          name: 'Vue.js',
          level: 70,
          icon: `<svg viewBox="0 0 128 128">
            <path d="M0 8.934l49.854.158 14.167 24.47 14.432-24.47L128 8.935l-63.834 110.14zm126.98.637l-24.36.02-38.476 66.053L25.691 9.592.942 9.572l63.211 107.89zm-25.149-.008l-22.745.168-15.053 24.647L49.216 9.73l-22.794-.168 37.731 64.476zm-75.834-.17l23.002.009m-23.002-.01l23.002.01" fill="none"></path>
            <path d="M25.997 9.393l23.002.009L64.035 34.36 79.018 9.404 102 9.398 64.15 75.053z" fill="#35495e"></path>
            <path d="M.91 9.569l25.067-.172 38.15 65.659L101.98 9.401l25.11.026-62.966 108.06z" fill="#41b883"></path>
          </svg>`
        },
        {
          name: 'Tailwind CSS',
          level: 0,
          icon: `<svg viewBox="0 0 128 128">
            <path fill="#38B2AC" d="M64 10C30.3 10 0 30.3 0 64s30.3 54 64 54 64-20.3 64-54S97.7 10 64 10zm0 98c-24.9 0-45-20.1-45-45s20.1-45 45-45 45 20.1 45 45-20.1 45-45 45z"></path>
            <path fill="#38B2AC" d="M64 34c-16.6 0-30 13.4-30 30s13.4 30 30 30 30-13.4 30-30-13.4-30-30-30zm0 54c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24z"></path>
          </svg>` 
        }
      ],
      otherSkills: [
        {
          name: 'Git',
          level: 40,
          icon: `<svg viewBox="0 0 128 128">
            <path fill="#F34F29" d="M124.737 58.378L69.621 3.264c-3.172-3.174-8.32-3.174-11.497 0L46.68 14.71l14.518 14.518c3.375-1.139 7.243-.375 9.932 2.314 2.703 2.706 3.461 6.607 2.294 9.993l13.992 13.993c3.385-1.167 7.292-.413 9.994 2.295 3.78 3.777 3.78 9.9 0 13.679a9.673 9.673 0 01-13.683 0 9.677 9.677 0 01-2.105-10.521L68.574 47.933l-.002 34.341a9.708 9.708 0 012.559 1.828c3.778 3.777 3.778 9.898 0 13.683-3.779 3.777-9.904 3.777-13.679 0-3.778-3.784-3.778-9.905 0-13.683a9.65 9.65 0 013.167-2.11V47.333a9.581 9.581 0 01-3.167-2.111c-2.862-2.86-3.551-7.06-2.083-10.576L41.056 20.333 3.264 58.123a8.133 8.133 0 000 11.5l55.117 55.114c3.174 3.174 8.32 3.174 11.499 0l54.858-54.858a8.135 8.135 0 00-.001-11.501z"/>
          </svg>`
        },
        {
          name: 'Node.js',
          level: 0,
          icon: `<svg viewBox="0 0 128 128">
            <path fill="#83CD29" d="M112.771 30.334L68.674 4.729c-2.781-1.584-6.402-1.584-9.205 0L14.901 30.334C12.031 31.985 10 35.088 10 38.407v51.142c0 3.319 2.084 6.423 4.954 8.083l11.775 6.688c5.628 2.772 7.617 2.772 10.178 2.772 8.333 0 13.093-5.039 13.093-13.828v-50.49c0-.713-.371-1.774-1.071-1.774h-5.623C42.594 40 41 41.402 41 42.176v50.49c0 4.624-1.781 9.596-8.857 9.596-4.123 0-5.418-1.044-11.024-3.749L9.343 91.863c-.874-.516-1.343-1.434-1.343-2.323V38.407c0-.888.469-1.807 1.343-2.323L54.017 10.3c.819-.453 2.132-.453 2.951 0l44.674 25.784c.819.453 1.343 1.434 1.343 2.323v51.133c0 .888-.469 1.807-1.343 2.323L56.968 117.7c-.819.453-2.132.453-2.951 0L44.285 111.1c-.819-.453-.469-1.434.35-1.887.819-.453 2.132-.453 2.951 0l9.732 5.597c.819.453 2.132.453 2.951 0l44.674-25.784c.819-.453 1.343-1.434 1.343-2.323V38.407c0-.888-.469-1.807-1.343-2.323z"/>
            <path fill="#404137" d="M87.027 61.615c0-4.624-2.625-7.333-6.667-7.333-3.896 0-7.188 2.709-7.188 7.333s3.292 7.333 7.188 7.333c4.042 0 6.667-2.709 6.667-7.333zm-13.855 0c0-3.896 2.917-6.5 7.188-6.5s7.188 2.604 7.188 6.5-2.917 6.5-7.188 6.5-7.188-2.604-7.188-6.5z"/>
          </svg>`
        }
      ]
    }
  }
}
</script>
<style scoped>
.about-page {
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

.page-motto {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  font-style: italic;
  max-width: 700px;
  margin: var(--spacing-sm) auto 0;
}

/* Introduction Section */
.intro-section {
  margin-bottom: var(--spacing-3xl);
}

.intro-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-3xl);
  align-items: center;
}

.intro-text {
  animation: fadeInLeft 0.8s ease-out;
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
}

.intro-description {
  font-size: var(--font-size-lg);
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.intro-visual {
  display: flex;
  justify-content: center;
  animation: fadeInRight 0.8s ease-out 0.2s both;
}

/* Profile Card */
.profile-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
  max-width: 280px;
  width: 100%;
}

.profile-avatar {
  margin-bottom: var(--spacing-lg);
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: var(--shadow-md);
}

.avatar-initials {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: white;
}

.profile-name {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.profile-role {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Skills Section */
.skills-section {
  margin-bottom: var(--spacing-3xl);
}

.section-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 700px;
  margin: 0 auto var(--spacing-xl) auto;
}

.skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

.skill-category {
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.category-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg) 0;
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-primary);
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.skill-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.skill-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.skill-icon svg {
  width: 100%;
  height: 100%;
}

.skill-info {
  flex: 1;
}

.skill-name {
  display: block;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.skill-level {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.skill-bar {
  flex: 1;
  height: 8px;
  background-color: var(--color-surface-alt);
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 4px;
  transition: width 1s ease-in-out;
}

.skill-percentage {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  min-width: 40px;
  text-align: right;
}

/* Values Section */
.values-section {
  margin-bottom: var(--spacing-3xl);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

.value-item {
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.value-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.value-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--spacing-lg);
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.value-icon svg {
  width: 28px;
  height: 28px;
}

.value-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.value-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
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
  .intro-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
    text-align: center;
  }

  .skills-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .values-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .section-title {
    font-size: var(--font-size-xl);
  }

  .intro-description {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .about-page {
    padding: var(--spacing-lg) 0;
  }

  .page-header {
    margin-bottom: var(--spacing-xl);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .skill-category,
  .value-item {
    padding: var(--spacing-lg);
  }

  .profile-card {
    padding: var(--spacing-lg);
  }
}
</style>