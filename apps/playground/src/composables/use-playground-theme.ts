import { computed, ref, watch } from 'vue'

type PlaygroundTheme = 'light' | 'dark'

const STORAGE_KEY = 'outline-forge-playground-theme'
const ATTRIBUTE = 'data-playground-theme'

function resolveInitialTheme(): PlaygroundTheme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<PlaygroundTheme>(resolveInitialTheme())

function syncDom(value: PlaygroundTheme) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute(ATTRIBUTE, value)
  document.documentElement.style.setProperty('color-scheme', value)
}

export function usePlaygroundTheme() {
  syncDom(theme.value)

  if (typeof window !== 'undefined') {
    watch(
      theme,
      (value) => {
        syncDom(value)
        window.localStorage.setItem(STORAGE_KEY, value)
      },
      { immediate: false },
    )
  }

  function setTheme(next: PlaygroundTheme) {
    if (next !== theme.value) {
      theme.value = next
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    isDark: computed(() => theme.value === 'dark'),
    setTheme,
    toggleTheme,
  }
}
