<template>
  <div class="app-container">
    <header class="app-header">
      <NuxtLink to="/" class="app-logo">Storyteller</NuxtLink>
      <nav style="display: flex; gap: 1rem;">
        <NuxtLink to="/" class="nav-link" exact-active-class="active">Home</NuxtLink>
        <NuxtLink to="/host" class="nav-link" active-class="active">Host Panel</NuxtLink>
      </nav>
    </header>
    <main class="main-content animate-fade-in">
      <slot />
    </main>
  </div>
</template>
