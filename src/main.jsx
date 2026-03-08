import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ── Storage polyfill ──────────────────────────────────────────
// In Claude artifacts, window.storage is provided by the sandbox.
// On a real browser (Vercel), we implement it using localStorage.
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      try {
        const value = localStorage.getItem(key)
        if (value === null) throw new Error('Key not found')
        return { key, value, shared: false }
      } catch (e) {
        throw e
      }
    },
    set: async (key, value, shared = false) => {
      try {
        localStorage.setItem(key, value)
        return { key, value, shared }
      } catch (e) {
        throw e
      }
    },
    delete: async (key, shared = false) => {
      try {
        localStorage.removeItem(key)
        return { key, deleted: true, shared }
      } catch (e) {
        throw e
      }
    },
    list: async (prefix = '', shared = false) => {
      try {
        const keys = Object.keys(localStorage).filter(k =>
          prefix ? k.startsWith(prefix) : true
        )
        return { keys, prefix, shared }
      } catch (e) {
        throw e
      }
    },
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
