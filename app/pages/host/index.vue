<template>
  <div>
    <div class="dashboard-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ t('hostPanelTitle') }}</h1>
        <p class="page-subtitle">{{ t('hostPanelDesc') }}</p>
      </div>
      <NuxtLink to="/host/template/new" class="btn btn-primary">
        {{ t('createTemplateBtn') }}
      </NuxtLink>
    </div>

    <!-- Templates Section -->
    <div class="glass-card templates-card animate-fade-in" style="animation-delay: 0.1s;">
      <h2 class="section-title">{{ t('savedTemplatesTitle') }}</h2>
      
      <div v-if="pending" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('loadingTemplates') }}</p>
      </div>

      <div v-else-if="!templates || templates.length === 0" class="empty-state">
        <span class="empty-icon">
          <svg class="empty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </span>
        <h3>{{ t('noTemplatesFound') }}</h3>
        <p>{{ t('noTemplatesDesc') }}</p>
        <NuxtLink to="/host/template/new" class="btn btn-primary" style="margin-top: 1rem;">
          {{ t('createTemplateBtn') }}
        </NuxtLink>
      </div>

      <div v-else class="templates-grid">
        <div v-for="temp in templates" :key="temp.id" class="template-card">
          <div class="template-info">
            <h3 class="template-title">{{ temp.title }}</h3>
            <p class="template-date">{{ t('createdOn', { date: formatDate(temp.createdAt) }) }}</p>
            <div class="template-stats">
              <span class="badge badge-primary">
                {{ t('uniqueVariables', { count: Object.keys(temp.blanksConfig || {}).length }) }}
              </span>
            </div>
          </div>
          
          <div class="template-actions">
            <button 
              @click="startSession(temp.id)" 
              class="btn btn-primary btn-sm"
              :disabled="startingId === temp.id"
            >
              <span v-if="startingId === temp.id" class="mini-spinner"></span>
              <span v-else>{{ t('startSessionBtn') }}</span>
            </button>
            <NuxtLink :to="`/host/template/${temp.id}`" class="btn btn-secondary btn-sm">
              {{ t('editBtn') }}
            </NuxtLink>
            <button 
              @click="confirmDelete(temp)" 
              class="btn btn-danger btn-sm"
              :disabled="deletingId === temp.id"
            >
              {{ t('deleteBtn') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Sessions Section -->
    <div class="glass-card sessions-card animate-fade-in" style="animation-delay: 0.2s;">
      <div class="section-header">
        <div>
          <h2 class="section-title">{{ t('activeSessionsTitle') }}</h2>
          <p class="section-desc">{{ t('activeSessionsDesc') }}</p>
        </div>
        <button
          class="btn btn-danger btn-sm"
          :disabled="killingExpired"
          @click="killExpiredSessions"
        >
          <span v-if="killingExpired" class="mini-spinner"></span>
          <span v-else>{{ t('killExpiredBtn') }}</span>
        </button>
      </div>

      <div v-if="sessionsPending" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('loadingSessions') }}</p>
      </div>

      <div v-else-if="!sessions || sessions.length === 0" class="empty-state sessions-empty">
        <h3>{{ t('noActiveSessions') }}</h3>
        <p>{{ t('noActiveSessionsDesc') }}</p>
      </div>

      <div v-else class="sessions-list">
        <div v-for="sess in sessions" :key="sess.id" class="session-card" :class="{ 'session-expired': isExpired(sess) }">
          <div class="session-info">
            <div class="session-top">
              <span class="session-code">{{ sess.id }}</span>
              <span class="session-badge" :class="sess.status === 'reveal' ? 'badge-reveal' : isExpired(sess) ? 'badge-expired' : 'badge-active'">
                {{ sess.status === 'reveal' ? t('sessionStatusReveal') : isExpired(sess) ? t('sessionExpiredBadge') : t('sessionActiveBadge') }}
              </span>
            </div>
            <div class="session-title">{{ sess.title }}</div>
            <div class="session-meta">
              <span>{{ t('sessionAnsweredLabel', { answered: sess.answeredCount, total: sess.blanksCount }) }}</span>
              <span class="session-age">{{ t('sessionAgeLabel') }} {{ formatRelativeTime(sess.updatedAt || sess.createdAt) }}</span>
            </div>
          </div>
          <button
            class="btn btn-danger btn-sm"
            :disabled="killingId === sess.id"
            @click="killSession(sess.id)"
          >
            <span v-if="killingId === sess.id" class="mini-spinner"></span>
            <span v-else>{{ t('killSessionBtn') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const startingId = ref(null)
const deletingId = ref(null)
const killingId = ref(null)
const killingExpired = ref(false)
const router = useRouter()

const EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

// Fetch templates list
const { data: templates, pending, refresh } = await useFetch('/api/templates', {
  server: false
})

// Fetch sessions list
const { data: sessions, pending: sessionsPending, refresh: refreshSessions } = await useFetch('/api/sessions', {
  server: false
})

const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatRelativeTime = (isoString) => {
  if (!isoString) return '—'
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

const isExpired = (sess) => {
  const lastActive = new Date(sess.updatedAt || sess.createdAt || 0).getTime()
  return Date.now() - lastActive >= EXPIRY_MS
}

// Start interactive session
const startSession = async (templateId) => {
  startingId.value = templateId
  try {
    const data = await $fetch('/api/sessions', {
      method: 'POST',
      body: { templateId }
    })
    
    // Save hostToken to authorization store in localStorage
    if (process.client) {
      localStorage.setItem(`host_token_${data.sessionId}`, data.hostToken)
    }
    
    // Redirect to Host Session panel
    router.push(`/host/session/${data.sessionId}`)
  } catch (err) {
    alert('Failed to start session: ' + (err.data?.message || err.message))
  } finally {
    startingId.value = null
  }
}

// Delete template
const confirmDelete = async (template) => {
  if (!confirm(t('confirmDeleteText', { title: template.title }))) {
    return
  }
  
  deletingId.value = template.id
  try {
    await $fetch(`/api/templates/${template.id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (err) {
    alert('Failed to delete template: ' + (err.data?.message || err.message))
  } finally {
    deletingId.value = null
  }
}

// Kill a single session (force — no host token required)
const killSession = async (sessionId) => {
  if (!confirm(t('confirmKillSession', { id: sessionId }))) return
  killingId.value = sessionId
  try {
    await $fetch(`/api/sessions/${sessionId}/force`, { method: 'DELETE' })
  } catch {
    // Session may already be gone — that's fine
  } finally {
    killingId.value = null
    await refreshSessions()
  }
}

// Kill all expired sessions (24h+)
const killExpiredSessions = async () => {
  killingExpired.value = true
  try {
    const result = await $fetch('/api/sessions/expired', { method: 'DELETE' })
    if (result.deletedCount > 0) {
      alert(t('expiredSessionsKilled', { count: result.deletedCount }))
    } else {
      alert(t('noExpiredSessions'))
    }
    await refreshSessions()
  } catch (err) {
    alert('Failed to kill expired sessions: ' + (err.data?.message || err.message))
  } finally {
    killingExpired.value = false
  }
}
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.page-title {
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.templates-card {
  padding: 2rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
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

.mini-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-svg {
  width: 48px;
  height: 48px;
  color: var(--md-sys-color-outline);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  max-width: 400px;
}

.templates-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.template-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--transition-fast);
}

.template-card:hover {
  border-color: var(--border-glow);
  background: rgba(30, 41, 59, 0.4);
}

@media (max-width: 768px) {
  .template-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
  .template-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

.template-title {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.template-date {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.template-stats {
  display: flex;
  gap: 0.5rem;
}

.template-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

/* Sessions Panel */
.sessions-card {
  padding: 2rem;
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.section-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.section-title {
  margin-bottom: 0;
}

.sessions-empty {
  padding: 3rem 1rem;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.session-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: border-color 0.2s;
}

.session-card:hover {
  border-color: var(--border-glow);
}

.session-card.session-expired {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.04);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.3rem;
}

.session-code {
  font-family: var(--font-mono, monospace);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.1em;
}

.session-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-active {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge-reveal {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.badge-expired {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.session-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.session-age {
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .session-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

</style>
