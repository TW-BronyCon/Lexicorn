<template>
  <div>
    <div class="dashboard-header animate-fade-in">
      <div>
        <h1 class="page-title">Host Panel</h1>
        <p class="page-subtitle">Manage your story templates and launch live interactive sessions.</p>
      </div>
      <NuxtLink to="/host/template/new" class="btn btn-primary">
        + Create Template
      </NuxtLink>
    </div>

    <!-- Templates Section -->
    <div class="glass-card templates-card animate-fade-in" style="animation-delay: 0.1s;">
      <h2 class="section-title">Saved Story Templates</h2>
      
      <div v-if="pending" class="loading-state">
        <div class="spinner"></div>
        <p>Loading templates...</p>
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
        <h3>No templates found</h3>
        <p>Start by creating your first story template containing blanks to fill.</p>
        <NuxtLink to="/host/template/new" class="btn btn-primary" style="margin-top: 1rem;">
          Create a Template
        </NuxtLink>
      </div>

      <div v-else class="templates-grid">
        <div v-for="temp in templates" :key="temp.id" class="template-card">
          <div class="template-info">
            <h3 class="template-title">{{ temp.title }}</h3>
            <p class="template-date">Created on {{ formatDate(temp.createdAt) }}</p>
            <div class="template-stats">
              <span class="badge badge-primary">
                {{ Object.keys(temp.blanksConfig || {}).length }} unique variables
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
              <span v-else>Start Session</span>
            </button>
            <NuxtLink :to="`/host/template/${temp.id}`" class="btn btn-secondary btn-sm">
              Edit
            </NuxtLink>
            <button 
              @click="confirmDelete(temp)" 
              class="btn btn-danger btn-sm"
              :disabled="deletingId === temp.id"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const startingId = ref(null)
const deletingId = ref(null)
const router = useRouter()

// Fetch templates list
const { data: templates, pending, refresh } = await useFetch('/api/templates', {
  server: false // Run on client side for easy refresh and consistent KV state
})

const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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
  if (!confirm(`Are you sure you want to delete "${template.title}"? This cannot be undone.`)) {
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
</style>
