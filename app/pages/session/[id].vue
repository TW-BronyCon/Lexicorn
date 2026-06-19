<template>
  <div class="kiosk-container">
    <!-- Loading Screen -->
    <div v-if="loading && !session" class="kiosk-center-card loading-card animate-fade-in">
      <div class="spinner"></div>
      <p class="loading-text">Locating storyteller room...</p>
    </div>

    <!-- Error Screen -->
    <div v-else-if="errorMsg" class="kiosk-center-card error-card animate-fade-in">
      <span class="warning-icon">
        <svg class="warning-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      <h2>Room Not Found</h2>
      <p>{{ errorMsg }}</p>
      <NuxtLink to="/" class="btn btn-primary">Return to Home</NuxtLink>
    </div>

    <!-- Main Viewer View -->
    <div v-else-if="session" class="kiosk-content animate-fade-in">
      
      <!-- Input Phase: Split Dashboard -->
      <div v-if="session.status === 'input'" class="kiosk-panels">
        
        <!-- Left Panel: Session Status & Big Code -->
        <div class="glass-card info-panel">
          <div class="live-badge-wrapper">
            <span class="live-indicator pulse-glow">● LIVE BROADCAST</span>
          </div>
          
          <h1 class="session-title">{{ session.title }}</h1>
          
          <div class="kiosk-code-box">
            <span class="label">Join the game with code:</span>
            <span class="code">{{ session.id }}</span>
          </div>

          <div class="radial-progress-box">
            <svg class="progress-ring" width="180" height="180">
              <circle
                class="progress-ring-circle-bg"
                stroke="rgba(255,255,255,0.03)"
                stroke-width="14"
                fill="transparent"
                r="78"
                cx="90"
                cy="90"
              />
              <circle
                class="progress-ring-circle"
                stroke="var(--md-sys-color-primary)"
                stroke-width="14"
                fill="transparent"
                r="78"
                cx="90"
                cy="90"
                :stroke-dasharray="strokeDasharray"
                :stroke-dashoffset="strokeDashoffset"
              />
            </svg>
            <div class="radial-label">
              <span class="percent-num">{{ percentComplete }}%</span>
              <span class="sub">collected</span>
            </div>
          </div>

          <div class="status-summary">
            <h2>The Host is gathering words...</h2>
            <p class="progress-desc">
              <strong>{{ session.filledBlanks }}</strong> / <strong>{{ session.totalBlanks }}</strong> completed
            </p>
          </div>
        </div>

        <!-- Right Panel: Scrolling Blanks Grid -->
        <div class="glass-card queue-panel">
          <h2 class="panel-subtitle">Blanks Checklist</h2>
          
          <div class="slots-grid">
            <div 
              v-for="(blank, index) in session.blanks" 
              :key="blank.id" 
              class="slot-card"
              :class="{ 
                filled: blank.isAnswered,
                active: session.currentQueueIndex === index,
                locked: !blank.isRevealed
              }"
            >
              <div class="slot-icon">
                <span v-if="session.currentQueueIndex === index" class="pulse-icon">
                  <svg class="typing-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                </span>
                <span v-else-if="blank.isAnswered" class="check-icon">
                  <svg class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span v-else class="lock-icon">
                  <svg class="lock-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              </div>
              <div class="slot-info">
                <span class="slot-name">{{ blank.name }}</span>
                <span class="slot-category">{{ blank.category || 'Word' }}</span>
                <span class="slot-status">
                  <span v-if="session.currentQueueIndex === index" class="status-typing">Host typing...</span>
                  <span v-else-if="blank.isAnswered" class="status-filled">Filled</span>
                  <span v-else-if="blank.isRevealed" class="status-pending">Waiting...</span>
                  <span v-else class="status-locked">Locked</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Reveal Phase: Show Story -->
      <div v-else class="kiosk-reveal-wrapper">
        <div class="glass-card reveal-card">
          <div class="reveal-header">
            <span class="completed-badge">THE STORY IS READY</span>
            <h1 class="story-title">{{ session.title }}</h1>
          </div>

          <div class="final-story-box animate-story-reveal">
            <div class="story-output-text kiosk-story-text" v-html="session.finalStory"></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const route = useRoute()
const session = ref(null)
const loading = ref(true)
const errorMsg = ref('')
const hostUrl = ref('')

let pollInterval = null

// Circle dimensions
const circleRadius = 78
const strokeDasharray = computed(() => 2 * Math.PI * circleRadius)

const percentComplete = computed(() => {
  if (!session.value || !session.value.totalBlanks) return 0
  return Math.round((session.value.filledBlanks / session.value.totalBlanks) * 100)
})

const strokeDashoffset = computed(() => {
  const percent = percentComplete.value
  const offset = strokeDasharray.value - (percent / 100) * strokeDasharray.value
  return offset
})

// Polling function
const syncSession = async () => {
  try {
    const data = await $fetch(`/api/sessions/${route.params.id}`)
    session.value = data
    errorMsg.value = ''
  } catch (err) {
    if (err.statusCode === 404) {
      errorMsg.value = `We couldn't find a live storyteller session with code "${route.params.id.toUpperCase()}".`
      stopPolling()
    } else {
      console.error('Polling error:', err)
    }
  } finally {
    loading.value = false
  }
}

const startPolling = () => {
  syncSession() // Run immediately
  pollInterval = setInterval(syncSession, 2000) // Poll every 2 seconds
}

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

onMounted(() => {
  startPolling()
  if (process.client) {
    hostUrl.value = window.location.host + '/host'
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.kiosk-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 3rem;
  background-color: var(--md-sys-color-background);
  color: var(--text-primary);
  overflow-y: auto;
  align-items: center;
  justify-content: center;
}

.kiosk-center-card {
  max-width: 600px;
  width: 100%;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 4rem 3rem;
  backdrop-filter: blur(16px);
}

.kiosk-content {
  width: 100%;
  max-width: 1300px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.kiosk-panels {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 2.5rem;
  align-items: stretch;
}

@media (max-width: 1024px) {
  .kiosk-panels {
    grid-template-columns: 1fr;
  }
}

.info-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.queue-panel {
  padding: 2.5rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Custom Scrollbar for Queue Panel */
.queue-panel::-webkit-scrollbar {
  width: 6px;
}
.queue-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 99px;
}
.queue-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
}

.panel-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.75rem;
}

.live-badge-wrapper {
  margin-bottom: 1.5rem;
}

.live-indicator {
  font-family: var(--font-sans);
  font-weight: 800;
  font-size: 0.8rem;
  color: #ff3366;
  background: rgba(255, 51, 102, 0.1);
  border: 1px solid rgba(255, 51, 102, 0.25);
  padding: 0.5rem 1.25rem;
  border-radius: 99px;
  letter-spacing: 0.1em;
}

.session-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.kiosk-code-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-light);
  padding: 1.25rem 2rem;
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 320px;
}

.kiosk-code-box .label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kiosk-code-box .code {
  font-family: var(--font-title);
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: var(--md-sys-color-primary);
}

/* Radial Progress styling */
.radial-progress-box {
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: 1.5rem;
}

.progress-ring-circle {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.radial-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.radial-label .percent-num {
  font-family: var(--font-title);
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1;
}

.radial-label .sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.1em;
  margin-top: 0.25rem;
}

.status-summary h2 {
  font-size: 1.3rem;
  margin-bottom: 0.25rem;
}

.progress-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.progress-desc strong {
  color: var(--text-primary);
  font-size: 1.25rem;
}

/* Slots Grid checklist */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.slot-card {
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  transition: var(--transition-fast);
}

.slot-card.filled {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.04);
}

.slot-card.active {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.06);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
  transform: scale(1.02);
}

.slot-card.locked {
  opacity: 0.3;
  border-style: dashed;
  background: rgba(255, 255, 255, 0.01);
}

.slot-icon {
  width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.typing-svg {
  width: 18px;
  height: 18px;
  color: var(--md-sys-color-primary);
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-svg {
  width: 18px;
  height: 18px;
  color: var(--md-sys-color-success);
}

.lock-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-svg {
  width: 18px;
  height: 18px;
  color: var(--md-sys-color-outline);
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.pulse-icon {
  animation: pulse-opacity 1.5s infinite ease-in-out;
}

.slot-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.slot-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-category {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-status {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.2rem;
}

.status-typing {
  color: var(--primary);
  animation: pulse-opacity 1.5s infinite ease-in-out;
}

.status-filled {
  color: var(--success);
}

.status-pending {
  color: var(--text-muted);
}

.status-locked {
  color: var(--text-muted);
  font-style: italic;
}

/* Reveal View Kiosk Styling */
.kiosk-reveal-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.reveal-card {
  max-width: 900px;
  width: 100%;
  padding: 4rem;
  background: var(--bg-card);
}

.completed-badge {
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  font-weight: 800;
  color: #a855f7;
  display: inline-block;
  margin-bottom: 0.75rem;
}

.reveal-header {
  text-align: center;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 2rem;
  margin-bottom: 3rem;
}

.story-title {
  font-size: 3rem;
  margin-bottom: 0;
  font-family: var(--font-title);
  font-weight: 800;
}

.final-story-box {
  background: rgba(10, 15, 30, 0.5);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-md);
  padding: 3.5rem;
  margin-bottom: 3rem;
  box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.6);
}

.kiosk-story-text {
  font-size: 1.8rem;
  line-height: 1.85;
}

.kiosk-story-text u {
  text-underline-offset: 6px;
  text-decoration-thickness: 4px;
  padding: 0 6px;
  background: rgba(168, 85, 247, 0.12);
  border-radius: 6px;
}

.reveal-footer {
  text-align: center;
  border-top: 1px solid var(--border-light);
  padding-top: 2rem;
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.highlight-link {
  color: #fff;
  background: rgba(99, 102, 241, 0.15);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-glow);
}

/* Base Spinner */
.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--border-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin: 0 auto 1.5rem;
}

.loading-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.warning-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.warning-svg {
  width: 64px;
  height: 64px;
  color: var(--md-sys-color-outline);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes storyReveal {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-story-reveal {
  animation: storyReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
