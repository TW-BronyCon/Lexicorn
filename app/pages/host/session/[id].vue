<template>
  <div>
    <!-- Not Authorized Warning -->
    <div v-if="authError" class="glass-card error-card animate-fade-in">
      <span class="warning-icon">
        <svg class="warning-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </span>
      <h2>{{ t('unauthorizedHost') }}</h2>
      <p>{{ authError }}</p>
      <div class="actions">
        <NuxtLink to="/host" class="btn btn-primary">{{ t('returnHostPanelBtn') }}</NuxtLink>
        <NuxtLink :to="`/session/${route.params.id}`" class="btn btn-secondary">
          {{ t('joinAsViewerBtn') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="glass-card loading-card animate-fade-in">
      <div class="spinner"></div>
      <p>{{ t('loadingSession') }}</p>
    </div>

    <!-- Active Session Controls -->
    <div v-else-if="session" class="session-grid animate-fade-in">
      
      <!-- Main Controller Column -->
      <div class="main-column">
        <!-- Header details -->
        <div class="glass-card session-header-card">
          <div class="header-details">
            <span class="session-badge">{{ t('activeSessionBadge') }}</span>
            <h1 class="session-title">{{ session.title }}</h1>
            
            <div class="code-and-link">
              <div class="code-box">
                <span class="label">{{ t('sessionCodeLabel') }}</span>
                <span class="code">{{ session.id }}</span>
              </div>
              <button @click="copyViewerLink" class="btn btn-secondary btn-sm copy-btn">
                {{ copied ? t('copiedText') : t('copyLinkBtn') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Gameplay Panel: Input Mode -->
        <div v-if="session.status === 'input'" class="glass-card gameplay-card">
          <!-- Progress -->
          <div class="progress-info">
            <span class="progress-text">
              {{ t('wordOfTotal', { current: session.currentQueueIndex + 1, total: session.queue.length }) }}
            </span>
            <span class="completion-text">
              {{ t('uniqueFields{{ t('filledStatus') }}', { filled: filledUniqueCount, total: uniqueCanonicalCount }) }}
            </span>
          </div>
          <div class="progress-container">
            <div 
              class="progress-bar" 
              :style="{ width: `${((session.currentQueueIndex + 1) / session.queue.length) * 100}%` }"
            ></div>
          </div>

          <!-- Active Prompt Card -->
          <div v-if="activeBlank" class="prompt-box">
            <div class="prompt-header">
              <span class="badge badge-primary">{{ activeBlank.category || 'Word' }}</span>
              <span v-if="isActiveBlankLinked" class="badge badge-success">Linked Reference</span>
            </div>
            
            <h2 class="prompt-name">{{ t('enterWordFor') }}<span class="placeholder-label">{{ activeBlank.name }}</span></h2>
            <p v-if="activeBlank.remarks" class="prompt-remarks">{{ activeBlank.remarks }}</p>

            <form @submit.prevent="saveAndNext" class="prompt-form">
              <div class="form-group">
                <input 
                  ref="wordInput"
                  v-model="inputValue" 
                  type="text" 
                  placeholder="Type a word..."
                  class="form-input big-input"
                  autofocus
                  required
                />
              </div>
              
              <div class="prompt-navigation">
                <button 
                  type="button" 
                  @click="goToPrevious" 
                  class="btn btn-secondary"
                  :disabled="session.currentQueueIndex === 0"
                >
                  {{ t('prevBtn') }}
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ isLastInQueue ? t('saveCompleteBtn') : t('saveNextBtn') }}
                </button>
              </div>
            </form>
          </div>

          <!-- Final Generation trigger -->
          <div v-if="isReadyToReveal" class="reveal-trigger-box">
            <p class="congrats-text">{{ t('allBlanks{{ t('filledStatus') }}') }}</p>
            <button @click="revealStory" class="btn btn-primary btn-lg pulse-glow w-full">
              {{ t('revealStoryBtn') }}
            </button>
          </div>
        </div>

        <!-- {{ t('livePreviewTitle') }} (Host Panel) -->
        <div v-if="session.status === 'input'" class="glass-card host-preview-card">
          <div class="host-preview-header" @click="showLivePreview = !showLivePreview">
            <div class="header-left">
              <span class="host-badge font-bold">{{ t('livePreviewBadge') }}</span>
              <h3>{{ t('livePreviewTitle') }}</h3>
            </div>
            <button class="btn btn-secondary btn-sm">
              {{ showLivePreview ? (locale.startsWith('zh') ? '隱藏預覽' : 'Hide Preview') : (locale.startsWith('zh') ? '顯示預覽' : 'Show Preview') }}
            </button>
          </div>
          
          <div v-if="showLivePreview" class="host-preview-content animate-fade-in">
            <p class="preview-help-text">{{ t('livePreviewDesc') }}</p>
            <div class="preview-story-box" v-html="finalStoryPreview || '{{ t('noBlanks{{ t('filledStatus') }}Yet') }}'"></div>
          </div>
        </div>

        <!-- Gameplay Panel: Reveal Mode -->
        <div v-else class="glass-card story-reveal-card">
          <div class="congrats-banner">
            <h2>{{ t('storyRevealedTitle') }}</h2>
            <p>{{ t('storyRevealedDesc') }}</p>
          </div>

          <div class="final-story-box">
            <div class="story-output-text" v-html="session.finalStory"></div>
          </div>

          <div class="reveal-actions">
            <button @click="replaySession" class="btn btn-secondary">
              {{ t('resetPlayAgainBtn') }}
            </button>
            <button @click="exitSession" class="btn btn-secondary">
              {{ t('exitDashboardBtn') }}
            </button>
          </div>
        </div>
      </div>

      <div class="sidebar-column glass-card sidebar-card">
        <div class="sidebar-header">
          <h3>{{ t('interactiveQueueTitle') }}</h3>
          <button @click="resetSession" class="btn btn-danger btn-sm">
            {{ locale.startsWith('zh') ? '重設' : 'Reset' }}
          </button>
        </div>
        <p class="sidebar-info">{{ t('sidebarInfoDesc') }}</p>

        <div class="queue-list">
          <button 
            v-for="(blankId, index) in session.queue" 
            :key="blankId"
            @click="jumpToQueueIndex(index)"
            class="queue-item-btn"
            :class="{ 
              active: session.currentQueueIndex === index && session.status === 'input',
              filled: isQueueItemAnswered(blankId)
            }"
            :disabled="session.status !== 'input'"
          >
            <span class="index-num">#{{ index + 1 }}</span>
            <div class="details">
              <span class="name">{{ getBlankDetails(blankId).name }}</span>
              <span class="category">{{ getBlankDetails(blankId).category }}</span>
            </div>
            
            <div class="status-indicator">
              <span v-if="isQueueItemAnswered(blankId)" class="status-check">
                <svg class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <span v-else class="status-dot"></span>
            </div>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const session = ref(null)
const hostToken = ref('')
const authError = ref('')

const inputValue = ref('')
const copied = ref(false)
const wordInput = ref(null)

// Computed helpers
const activeBlank = computed(() => {
  if (!session.value || session.value.status !== 'input') return null
  const activeId = session.value.queue[session.value.currentQueueIndex]
  return session.value.blanks.find(b => b.id === activeId)
})

const isActiveBlankLinked = computed(() => {
  if (!activeBlank.value) return false
  return activeBlank.value.name !== activeBlank.value.canonicalName
})

const isLastInQueue = computed(() => {
  if (!session.value) return false
  return session.value.currentQueueIndex === session.value.queue.length - 1
})

const uniqueCanonicalCount = computed(() => {
  if (!session.value) return 0
  const uniques = new Set(session.value.blanks.map(b => b.canonicalName))
  return uniques.size
})

const filledUniqueCount = computed(() => {
  if (!session.value) return 0
  return Object.keys(session.value.answers || {}).length
})

const showLivePreview = ref(false)

const renderPreview = (rawText, answers) => {
  if (!rawText) return ''
  const regex = /【([^】]+)】|\[([^\]]+)\]/g
  return rawText.replace(regex, (match, p1, p2) => {
    const name = (p1 || p2 || '').trim()
    const canonicalName = name.replace(/\s*\((Reference|Ref|reference|ref)(\s+\d+)?\)$/i, '').trim()
    const answer = (answers || {})[canonicalName]
    if (answer !== undefined && answer !== null && answer.trim() !== '') {
      return `<u>${answer}</u>`
    }
    return match
  })
}

const finalStoryPreview = computed(() => {
  if (!session.value) return ''
  return renderPreview(session.value.rawText, session.value.answers)
})

const isReadyToReveal = computed(() => {
  if (!session.value) return false
  // Check if every canonical name in blanks has an answer
  return session.value.blanks.every(b => {
    const ans = (session.value.answers || {})[b.canonicalName]
    return ans !== undefined && ans !== null && ans.trim() !== ''
  })
})

// Check if a specific blank is answered
const isQueueItemAnswered = (blankId) => {
  if (!session.value) return false
  const blank = session.value.blanks.find(b => b.id === blankId)
  if (!blank) return false
  const ans = (session.value.answers || {})[blank.canonicalName]
  return ans !== undefined && ans !== null && ans.trim() !== ''
}

// Get blank details
const getBlankDetails = (blankId) => {
  if (!session.value) return { name: '', category: '' }
  return session.value.blanks.find(b => b.id === blankId) || { name: '', category: '' }
}

const lastSyncedCandidate = ref('')
let debounceTimeout = null

const clearCandidateDebounce = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
    debounceTimeout = null
  }
}

watch(inputValue, (newVal) => {
  const trimmed = newVal.trim()
  if (trimmed === lastSyncedCandidate.value) return
  
  clearCandidateDebounce()
  
  debounceTimeout = setTimeout(async () => {
    if (!session.value) return
    lastSyncedCandidate.value = trimmed
    try {
      await $fetch(`/api/sessions/${session.value.id}/update`, {
        method: 'POST',
        headers: { 'x-host-token': hostToken.value },
        body: {
          currentCandidate: trimmed
        }
      })
    } catch (err) {
      console.error('Failed to update candidate:', err)
    }
  }, 300)
})

const updateInputValue = (isForward = false) => {
  if (!activeBlank.value) return
  const canonicalName = activeBlank.value.canonicalName
  const prevAnswer = (session.value.answers || {})[canonicalName]
  
  lastSyncedCandidate.value = prevAnswer || ''
  inputValue.value = prevAnswer || ''

  if (isForward && isActiveBlankLinked.value && prevAnswer) {
    nextTick(() => {
      saveAndNext()
    })
    return
  }
  
  // Refocus input field on next tick
  nextTick(() => {
    if (wordInput.value) {
      wordInput.value.focus()
    }
  })
}

// Watch queue index to handle prefill and auto-advance
watch(() => session.value?.currentQueueIndex, (newVal, oldVal) => {
  if (newVal === undefined) return
  const isForward = oldVal !== undefined && newVal > oldVal
  updateInputValue(isForward)
}, { immediate: true })

// Actions
const copyViewerLink = () => {
  if (process.client) {
    const link = `${window.location.origin}/session/${session.value.id}`
    navigator.clipboard.writeText(link).then(() => {
      copied.value = true
      setTimeout(() => { copied.value = false }, 2000)
    })
  }
}

const saveAndNext = async () => {
  clearCandidateDebounce()
  if (!activeBlank.value) return
  const currentVal = inputValue.value.trim()
  if (!currentVal) return

  // Optimistic update locally
  const canonicalName = activeBlank.value.canonicalName
  session.value.answers[canonicalName] = currentVal

  // Compute next index
  let nextIndex = session.value.currentQueueIndex
  if (session.value.currentQueueIndex < session.value.queue.length - 1) {
    nextIndex += 1
  }

  try {
    const res = await $fetch(`/api/sessions/${session.value.id}/update`, {
      method: 'POST',
      headers: { 'x-host-token': hostToken.value },
      body: {
        answers: { [canonicalName]: currentVal },
        currentQueueIndex: nextIndex
      }
    })
    
    session.value.answers = res.session.answers
    session.value.currentQueueIndex = res.session.currentQueueIndex
  } catch (err) {
    alert('Failed to save answer: ' + (err.data?.message || err.message))
  }
}

const goToPrevious = async () => {
  clearCandidateDebounce()
  if (session.value.currentQueueIndex === 0) return
  const prevIndex = session.value.currentQueueIndex - 1

  try {
    const res = await $fetch(`/api/sessions/${session.value.id}/update`, {
      method: 'POST',
      headers: { 'x-host-token': hostToken.value },
      body: {
        currentQueueIndex: prevIndex
      }
    })
    
    session.value.currentQueueIndex = res.session.currentQueueIndex
  } catch (err) {
    alert('Failed to navigate: ' + (err.data?.message || err.message))
  }
}

const jumpToQueueIndex = async (index) => {
  clearCandidateDebounce()
  if (session.value.status !== 'input') return
  try {
    const res = await $fetch(`/api/sessions/${session.value.id}/update`, {
      method: 'POST',
      headers: { 'x-host-token': hostToken.value },
      body: {
        currentQueueIndex: index
      }
    })
    session.value.currentQueueIndex = res.session.currentQueueIndex
  } catch (err) {
    alert('Failed to jump to blank: ' + (err.data?.message || err.message))
  }
}

const revealStory = async () => {
  try {
    const res = await $fetch(`/api/sessions/${session.value.id}/update`, {
      method: 'POST',
      headers: { 'x-host-token': hostToken.value },
      body: {
        status: 'reveal'
      }
    })
    session.value.status = res.session.status
    session.value.finalStory = res.session.finalStory
  } catch (err) {
    alert('Failed to reveal story: ' + (err.data?.message || err.message))
  }
}

const resetSession = async () => {
  if (!confirm(t('confirmResetPrompt'))) {
    return
  }
  
  clearCandidateDebounce()
  try {
    const res = await $fetch(`/api/sessions/${session.value.id}/reset`, {
      method: 'POST',
      headers: { 'x-host-token': hostToken.value }
    })
    
    session.value = res.session
    updateInputValue(false)
  } catch (err) {
    alert('Failed to reset session: ' + (err.data?.message || err.message))
  }
}

const exitSession = async () => {
  if (!confirm(t('confirmExitPrompt'))) {
    return
  }
  clearCandidateDebounce()
  try {
    await $fetch(`/api/sessions/${session.value.id}`, {
      method: 'DELETE',
      headers: { 'x-host-token': hostToken.value }
    })
    if (process.client) {
      localStorage.removeItem(`host_token_${session.value.id}`)
    }
  } catch (err) {
    console.error('Failed to terminate session:', err)
  }
  router.push('/host')
}

const replaySession = async () => {
  if (!confirm(t('confirmReplayPrompt'))) {
    return
  }
  clearCandidateDebounce()
  const templateId = session.value.templateId
  try {
    await $fetch(`/api/sessions/${session.value.id}`, {
      method: 'DELETE',
      headers: { 'x-host-token': hostToken.value }
    })
    if (process.client) {
      localStorage.removeItem(`host_token_${session.value.id}`)
    }

    const data = await $fetch('/api/sessions', {
      method: 'POST',
      body: { templateId }
    })
    
    if (process.client) {
      localStorage.setItem(`host_token_${data.sessionId}`, data.hostToken)
    }
    
    router.push(`/host/session/${data.sessionId}`)
  } catch (err) {
    alert('Failed to start new session: ' + (err.data?.message || err.message))
    router.push('/host')
  }
}

// Initial Sync
onMounted(async () => {
  const sessionId = route.params.id
  if (process.client) {
    hostToken.value = localStorage.getItem(`host_token_${sessionId}`) || ''
  }

  if (!hostToken.value) {
    authError.value = 'No host authorization token was found in local storage for this session code.'
    loading.value = false
    return
  }

  try {
    const data = await $fetch(`/api/sessions/${sessionId}`, {
      headers: { 'x-host-token': hostToken.value }
    })
    session.value = data
    updateInputValue(false)
  } catch (err) {
    authError.value = err.data?.message || err.message || 'Failed to authenticate host access.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.session-grid {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 900px) {
  .session-grid {
    grid-template-columns: 1fr;
  }
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.session-header-card {
  padding: 1.5rem 2rem;
}

.session-badge {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: var(--primary);
  display: inline-block;
  margin-bottom: 0.5rem;
}

.session-title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.code-and-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  border-top: 1px solid var(--border-light);
  padding-top: 1rem;
}

.code-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-box .label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.code-box .code {
  font-family: var(--font-title);
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.gameplay-card, .story-reveal-card {
  padding: 2.5rem 2rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.progress-text {
  font-weight: 600;
  color: var(--text-primary);
}

.prompt-box {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 2rem;
  margin: 1.5rem 0;
}

.prompt-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.prompt-name {
  font-size: 1.3rem;
  margin-bottom: 0.25rem;
}

.placeholder-label {
  color: #c084fc;
}

.prompt-remarks {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.big-input {
  font-size: 1.5rem;
  padding: 1rem;
  text-align: center;
  font-weight: 500;
  border-color: var(--border-glow);
}

.prompt-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.reveal-trigger-box {
  margin-top: 2rem;
  border-top: 1px solid var(--border-light);
  padding-top: 2rem;
  text-align: center;
}

.congrats-text {
  font-size: 1.1rem;
  color: var(--success);
  margin-bottom: 1rem;
  font-weight: 600;
}

.w-full {
  width: 100%;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.2rem;
}

.congrats-banner {
  text-align: center;
  margin-bottom: 2rem;
}

.congrats-banner h2 {
  color: #c084fc;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.final-story-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-sm);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
}

.reveal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Sidebar Column styles */
.sidebar-card {
  padding: 1.5rem;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.sidebar-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.queue-item-btn {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.8rem;
  display: flex;
  align-items: center;
  text-align: left;
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-primary);
  width: 100%;
}

.queue-item-btn:hover {
  background: rgba(30, 41, 59, 0.4);
  border-color: var(--text-muted);
}

.queue-item-btn.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
}

.queue-item-btn.filled {
  border-color: rgba(16, 185, 129, 0.3);
}

.index-num {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-muted);
  width: 30px;
}

.queue-item-btn.active .index-num {
  color: var(--primary);
}

.queue-item-btn.filled .index-num {
  color: var(--success);
}

.queue-item-btn .details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.queue-item-btn .name {
  font-size: 0.9rem;
  font-weight: 600;
}

.queue-item-btn .category {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
}

.status-check {
  color: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-svg {
  width: 14px;
  height: 14px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--text-muted);
  border-radius: 50%;
}

.error-card {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 3rem auto;
}

.warning-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.warning-svg {
  width: 64px;
  height: 64px;
  color: var(--md-sys-color-error);
}

.error-card h2 {
  margin-bottom: 0.75rem;
}

.error-card p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.error-card .actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem;
  max-width: 600px;
  margin: 3rem auto;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* {{ t('livePreviewTitle') }} (Host Panel) styling */
.host-preview-card {
  padding: 1.75rem;
  border: 1px dashed rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.02);
  border-radius: var(--radius-md);
  margin-top: 1.5rem;
}

.host-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.host-preview-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #fff;
  font-weight: 700;
}

.host-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.preview-help-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.preview-story-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  font-size: 1.2rem;
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
}

.preview-story-box u {
  text-underline-offset: 4px;
  text-decoration-thickness: 2px;
  padding: 0 4px;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 4px;
}
</style>
