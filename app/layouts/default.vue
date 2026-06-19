<template>
  <div class="app-container">
    <header class="app-header">
      <NuxtLink to="/" class="app-logo">{{ t('logo') }}</NuxtLink>
      <div style="display: flex; align-items: center; gap: 1.5rem;">
        <nav style="display: flex; gap: 1rem;">
          <NuxtLink to="/" class="nav-link" exact-active-class="active">{{ t('home') }}</NuxtLink>
          <NuxtLink to="/host" class="nav-link" active-class="active">{{ t('hostPanel') }}</NuxtLink>
        </nav>
        <div class="lang-selector-wrapper">
          <select :value="locale" @change="e => setLocale(e.target.value as any)" class="lang-select">
            <option value="en">English</option>
            <option value="zh-TW">繁體中文</option>
            <option value="zh-CN">简体中文</option>
          </select>
        </div>
      </div>
    </header>
    <main class="main-content animate-fade-in">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { locale, setLocale, t } = useI18n()
</script>

<style scoped>
.lang-select {
  padding: 0.35rem 2rem 0.35rem 0.75rem;
  background: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-shape-corner-small);
  color: var(--md-sys-color-on-surface-variant);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  transition: var(--transition-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239c89a0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
}

.lang-select:hover {
  border-color: var(--md-sys-color-outline);
  color: var(--md-sys-color-on-surface);
}

.lang-select:focus {
  border-color: var(--md-sys-color-primary);
}

.lang-select option {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-background);
}
</style>
