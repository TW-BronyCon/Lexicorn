<template>
  <div>
    <div class="editor-header animate-fade-in">
      <h1 class="page-title">{{ isNew ? t('newTemplateTitle') : t('editTemplateTitle') }}</h1>
      <NuxtLink to="/host" class="btn btn-secondary btn-sm">
        {{ t('backToDashboardBtn') }}
      </NuxtLink>
    </div>

    <div v-if="loading" class="glass-card loading-card animate-fade-in">
      <div class="spinner"></div>
      <p>{{ t('loadingTemplate') }}</p>
    </div>

    <form v-else @submit.prevent="saveTemplate" class="editor-layout animate-fade-in" style="animation-delay: 0.1s;">
      <!-- Left Column: Story Input -->
      <div class="glass-card editor-main">
        <div class="form-group">
          <label class="form-label" for="title">{{ t('templateTitleLabel') }}</label>
          <input 
            v-model="template.title" 
            type="text" 
            id="title" 
            :placeholder="t('templateTitlePlaceholder')"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <div class="label-with-help">
            <label class="form-label" for="rawText">{{ t('templateContentLabel') }}</label>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <span class="help-trigger" @click="triggerFileUpload">
                <svg class="help-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {{ t('uploadFileBtn') }}
              </span>
              <span class="help-trigger" @click="showSyntaxHelp = !showSyntaxHelp">
                <svg class="help-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Formatting Help
              </span>
            </div>
            <!-- Hidden File Input -->
            <input 
              type="file" 
              ref="fileInput" 
              style="display: none" 
              accept=".md,.txt" 
              @change="handleFileUpload"
            />
          </div>

          <div v-if="showSyntaxHelp" class="syntax-help-box">
            <p><strong>How to write placeholders:</strong></p>
            <ul>
              <li>Use brackets like <code>【Noun 1】</code> or <code>[Noun 1]</code> for blanks.</li>
              <li>To link placeholders together, use the suffix <code>(Reference)</code> or <code>(Ref)</code>:</li>
              <li>Example: <code>【Food 1】</code> and <code>【Food 1 (Reference)】</code> will map to the same variable.</li>
            </ul>
          </div>

          <textarea 
            v-model="template.rawText" 
            id="rawText" 
            :placeholder="t('templateContentPlaceholder')"
            class="form-input form-textarea"
            required
            @input="onTextChange"
            @blur="onTextBlur"
          ></textarea>
        </div>

        <div class="editor-actions">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            <span v-else>{{ t('saveTemplateBtn') }}</span>
          </button>
          <NuxtLink to="/host" class="btn btn-secondary">
            {{ t('cancelBtn') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Right Column: Blanks Config -->
      <div class="glass-card editor-sidebar">
        <h2 class="sidebar-title">{{ t('variablesHeader') }}</h2>
        <p class="sidebar-desc">{{ t('variablesDesc') }}</p>

        <div v-if="detectedPlaceholders.length === 0" class="no-placeholders-state">
          <p>{{ t('noVariablesDetected') }}</p>
        </div>

        <div v-else class="placeholders-list">
          <div v-for="name in detectedPlaceholders" :key="name" class="placeholder-config-card">
            <div class="card-header">
              <span class="placeholder-tag">{{ name }}</span>
              <span v-if="isLinkedReference(name)" class="badge badge-success flex-badge">
                {{ t('linkedReferenceBadge') }}
              </span>
            </div>

            <div class="card-body">
              <div class="form-group sm-group">
                <label class="form-label sm-label">{{ t('categoryLabel') }}</label>
                <input 
                  v-model="blanksConfig[name].category" 
                  type="text" 
                  :placeholder="t('categoryPlaceholder')"
                  class="form-input sm-input"
                />
              </div>
              <div class="form-group sm-group">
                <label class="form-label sm-label">{{ t('remarksLabel') }}</label>
                <input 
                  v-model="blanksConfig[name].remarks" 
                  type="text" 
                  :placeholder="t('remarksPlaceholder')"
                  class="form-input sm-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.params.id === 'new')

useHead({
  title: () => {
    if (isNew.value) {
      return `${t('newTemplateTitle')} - ${t('logo')}`
    }
    const templateTitle = template.value?.title || ''
    return `${t('editTemplateTitle')}${templateTitle ? `: ${templateTitle}` : ''} - ${t('logo')}`
  }
})

const loading = ref(false)
const saving = ref(false)
const showSyntaxHelp = ref(false)

const template = ref({
  title: '',
  rawText: ''
})
const blanksConfig = ref({})
const detectedPlaceholders = ref([])

const fileInput = ref(null)

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const autoIncrementPlaceholders = (rawText) => {
  const regex = /【([^】]+)】|\[([^\]]+)\]/g
  const matches = []

  let match
  while ((match = regex.exec(rawText)) !== null) {
    const text = match[0]
    const name = (match[1] || match[2] || '').trim()
    const bracketType = text.startsWith('【') ? '【】' : '[]'
    
    // Parse name
    const refRegex = /\s*\((Reference|Ref|reference|ref)(?:\s+(\d+))?\)$/i
    const refMatch = name.match(refRegex)
    const isRef = !!refMatch
    const refSuffix = refMatch ? refMatch[0] : ''
    const refNum = refMatch && refMatch[2] ? parseInt(refMatch[2], 10) : null

    const cleanName = isRef ? name.slice(0, name.length - refSuffix.length).trim() : name.trim()

    const numRegex = /\s+(\d+)$/
    const numMatch = cleanName.match(numRegex)
    const baseName = numMatch ? cleanName.slice(0, cleanName.length - numMatch[0].length).trim() : cleanName
    const numSuffix = numMatch ? parseInt(numMatch[1], 10) : null

    matches.push({
      start: match.index,
      end: regex.lastIndex,
      text,
      bracketType,
      name,
      isRef,
      refNum,
      cleanName,
      baseName,
      numSuffix
    })
  }

  // Count non-reference occurrences for each baseName
  const nonRefCounts = {}
  matches.forEach(m => {
    if (!m.isRef) {
      nonRefCounts[m.baseName] = (nonRefCounts[m.baseName] || 0) + 1
    }
  })

  // Assign new names
  const nonRefIndices = {}
  const newNames = matches.map(m => {
    const totalNonRefs = nonRefCounts[m.baseName] || 0
    if (totalNonRefs <= 1) {
      return m.name
    }

    if (!m.isRef) {
      nonRefIndices[m.baseName] = (nonRefIndices[m.baseName] || 0) + 1
      const idx = nonRefIndices[m.baseName]
      return `${m.baseName} ${idx}`
    } else {
      const targetIdx = m.refNum || m.numSuffix || 1
      return `${m.baseName} ${targetIdx} (Reference)`
    }
  })

  // Reconstruct rawText
  let result = ''
  let lastIdx = 0
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    const newName = newNames[i]
    result += rawText.slice(lastIdx, m.start)
    if (m.bracketType === '【】') {
      result += `【${newName}】`
    } else {
      result += `[${newName}]`
    }
    lastIdx = m.end
  }
  result += rawText.slice(lastIdx)

  return result
}

const handleFileUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result
    if (typeof text === 'string') {
      // Auto-increment placeholders
      const processedText = autoIncrementPlaceholders(text)
      template.value.rawText = processedText
      
      // Auto-fill title if empty
      if (!template.value.title || !template.value.title.trim()) {
        const baseName = file.name.replace(/\.[^/.]+$/, "") // Strip extension
        template.value.title = baseName
      }
      
      // Update variables list
      onTextChange()
    }
  }
  reader.readAsText(file)
  
  // Clear input value so same file can be uploaded again
  event.target.value = ''
}

const onTextBlur = () => {
  if (template.value.rawText) {
    const formatted = autoIncrementPlaceholders(template.value.rawText)
    if (formatted !== template.value.rawText) {
      template.value.rawText = formatted
      onTextChange()
    }
  }
}

// Helper to strip suffix for linking
const getCanonicalName = (name) => {
  return name.replace(/\s*\((Reference|Ref|reference|ref)(\s+\d+)?\)$/i, '').trim()
}

// Check if a placeholder name is a linked reference
const isLinkedReference = (name) => {
  return getCanonicalName(name) !== name
}

// Client-side extraction of unique placeholders
const extractPlaceholders = (text) => {
  const list = []
  const regex = /【([^】]+)】|\[([^\]]+)\]/g
  let match
  const seen = new Set()
  
  while ((match = regex.exec(text || '')) !== null) {
    const name = (match[1] || match[2] || '').trim()
    if (name && !seen.has(name)) {
      seen.add(name)
      list.push(name)
    }
  }
  return list
}

// When text input updates, update detected placeholders and populate configs
const onTextChange = () => {
  const current = extractPlaceholders(template.value.rawText)
  
  // Update blanksConfig with defaults for newly added placeholders
  current.forEach(name => {
    if (!blanksConfig.value[name]) {
      // If it's a reference, try to copy the category/remarks of the canonical version
      const canonical = getCanonicalName(name)
      const isRef = canonical !== name
      const copyFrom = isRef ? (blanksConfig.value[canonical] || null) : null
      
      blanksConfig.value[name] = {
        category: copyFrom?.category || (isRef ? `Reference to ${canonical}` : ''),
        remarks: copyFrom?.remarks || (isRef ? `The same ${canonical} as before` : '')
      }
    }
  })
  
  detectedPlaceholders.value = current
}

// Fetch template details if editing
const fetchTemplate = async () => {
  if (isNew.value) return
  
  loading.value = true
  try {
    const data = await $fetch(`/api/templates/${route.params.id}`)
    template.value = {
      title: data.title,
      rawText: data.rawText
    }
    blanksConfig.value = { ...data.blanksConfig }
    onTextChange()
  } catch (err) {
    alert('Failed to load template: ' + (err.data?.message || err.message))
    router.push('/host')
  } finally {
    loading.value = false
  }
}

const saveTemplate = async () => {
  saving.value = true
  try {
    const payload = {
      title: template.value.title,
      rawText: template.value.rawText,
      blanksConfig: blanksConfig.value
    }
    
    if (isNew.value) {
      await $fetch('/api/templates', {
        method: 'POST',
        body: payload
      })
    } else {
      await $fetch(`/api/templates/${route.params.id}`, {
        method: 'PUT',
        body: payload
      })
    }
    
    router.push('/host')
  } catch (err) {
    alert('Failed to save template: ' + (err.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchTemplate()
})
</script>

<style scoped>
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin-bottom: 0;
}

.editor-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

.editor-main, .editor-sidebar {
  padding: 2rem;
}

.form-textarea {
  min-height: 250px;
}

.label-with-help {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.label-with-help .form-label {
  margin-bottom: 0;
}

.help-trigger {
  font-size: 0.85rem;
  color: var(--primary);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.help-svg {
  width: 16px;
  height: 16px;
}

.help-trigger:hover {
  text-decoration: underline;
  filter: brightness(1.2);
}

.syntax-help-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px dashed var(--border-glow);
  border-radius: var(--radius-sm);
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.syntax-help-box ul {
  padding-left: 1.25rem;
  margin-top: 0.5rem;
  color: var(--text-secondary);
}

.syntax-help-box li {
  margin-bottom: 0.25rem;
}

.syntax-help-box code {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-family: monospace;
}

.editor-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.sidebar-title {
  font-size: 1.3rem;
  margin-bottom: 0.25rem;
}

.sidebar-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.no-placeholders-state {
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-sm);
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.no-placeholders-state .sub {
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.no-placeholders-state code {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.1rem 0.25rem;
  border-radius: 3px;
  font-family: monospace;
}

.placeholders-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.placeholder-config-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.placeholder-tag {
  font-family: var(--font-title);
  font-weight: 700;
  color: #c084fc;
}

.flex-badge {
  text-transform: none;
  font-size: 0.7rem;
}

.sm-group {
  margin-bottom: 0.75rem;
}

.sm-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.sm-input {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem;
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
</style>
