'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  isDark: boolean
  isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Computed values for easy access
  const isDark = theme === 'dark'
  const isLight = theme === 'light'

  // Initialize theme immediately on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('jobstash-theme') as Theme
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        setTheme(savedTheme)
      } else {
        // If no valid theme or invalid theme, default to light
        setTheme('light')
        localStorage.setItem('jobstash-theme', 'light')
      }
      
      // Apply initial theme to avoid flash
      const root = document.documentElement
      const initialTheme = (savedTheme && ['light', 'dark'].includes(savedTheme)) ? savedTheme : 'light'
      if (initialTheme === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Save theme to localStorage whenever it changes
      localStorage.setItem('jobstash-theme', theme)

      // Set resolved theme (now it's always the same as theme)
      setResolvedTheme(theme)

      // Apply theme to document
      const root = document.documentElement
      
      if (theme === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
      }
      
      // Force update by setting the data attribute as well
      root.setAttribute('data-theme', theme)
      
      console.log('Theme applied:', theme, 'HTML classes:', root.className, 'Dark class present:', root.classList.contains('dark'))
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isDark, isLight }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
