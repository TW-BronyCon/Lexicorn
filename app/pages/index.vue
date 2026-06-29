<template>
  <div class="home-grid">
    <!-- Hero / Intro -->
    <div class="hero-section">
      <h1 class="hero-title">{{ t('heroTitle1') }} <span class="accent-text">{{ t('heroTitleAccent') }}</span></h1>
      <p class="hero-desc">
        {{ t('heroDesc') }}
      </p>
      
      <div class="features-list">
        <div class="feature-item">
          <span class="feature-icon">
            <svg class="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
          </span>
          <div>
            <h3>{{ t('feature1Title') }}</h3>
            <p>{{ t('feature1Desc') }}</p>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">
            <svg class="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </span>
          <div>
            <h3>{{ t('feature2Title') }}</h3>
            <p>{{ t('feature2Desc') }}</p>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">
            <svg class="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </span>
          <div>
            <h3>{{ t('feature3Title') }}</h3>
            <p>{{ t('feature3Desc') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Actions -->
    <div class="actions-section">
      <!-- Join Card -->
      <div class="glass-card join-card pulse-glow">
        <h2>{{ t('joinTitle') }}</h2>
        <p>{{ t('joinDesc') }}</p>
        
        <form @submit.prevent="handleJoin" class="join-form">
          <div class="form-group">
            <input 
              v-model="sessionCode" 
              type="text" 
              :placeholder="t('joinInputPlaceholder')" 
              maxlength="6"
              class="form-input code-input"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary w-full">
            {{ t('joinButton') }}
          </button>
          <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        </form>
      </div>

      <!-- Host Card -->
      <div class="glass-card host-cta">
        <h2>{{ t('hostTitle') }}</h2>
        <p>{{ t('hostDesc') }}</p>
        <NuxtLink to="/host" class="btn btn-secondary w-full" external>
          {{ t('hostButton') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const sessionCode = ref('')
const errorMsg = ref('')
const router = useRouter()

useHead({
  title: () => `${t('logo')} - Taiwan BronyCon Interactive Story Game`
})

const handleJoin = () => {
  errorMsg.value = ''
  const code = sessionCode.value.trim().toUpperCase()
  if (code.length !== 6) {
    errorMsg.value = t('joinErrorLength')
    return
  }
  
  router.push(`/session/${code}`)
}
</script>

<style scoped>
.home-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 768px) {
  .home-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.hero-section {
  display: flex;
  flex-direction: column;
}

.hero-title {
  font-size: 3rem;
  line-height: 1.15;
  margin-bottom: 1.5rem;
}

.accent-text {
  color: var(--md-sys-color-primary);
}

.hero-desc {
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  max-width: 600px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
}

.feature-icon {
  background: rgba(255, 255, 255, 0.05);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  flex-shrink: 0;
}

.feature-svg {
  width: 24px;
  height: 24px;
  color: var(--md-sys-color-primary);
}

.feature-item h3 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.feature-item p {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.join-card h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.code-input {
  text-align: center;
  font-family: var(--font-title);
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  padding: 0.75rem;
  text-transform: uppercase;
}

.w-full {
  width: 100%;
}

.error-text {
  color: var(--error);
  font-size: 0.85rem;
  margin-top: 0.75rem;
  text-align: center;
}

.host-cta h2 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}
</style>
