import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@michael-nussbaumer/nuxt-directus',
  description: 'A production-ready Nuxt 4 module that integrates Directus SDK with authentication, configurable global auth middleware, and automatic TypeScript type generation.',
  
  srcDir: '../docs',
  base: '/nuxt-directus-module/',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'API', link: '/api' },
      { 
        text: 'v0.2.3',
        items: [
          { text: 'Changelog', link: 'https://github.com/Michael-Nussbaumer/nuxt-directus-module/releases' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@michael-nussbaumer/nuxt-directus' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is nuxt-directus?', link: '/index' },
          { text: 'Getting Started', link: '/getting-started' },
        ]
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Configuration', link: '/configuration' },
          { text: 'Authentication', link: '/authentication' },
          { text: 'API Usage', link: '/api' },
          { text: 'Middleware', link: '/middleware' },
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'Realtime (WebSocket)', link: '/realtime' },
          { text: 'Role-Based Permissions', link: '/role-based-permissions' },
          { text: 'Type Generation', link: '/type-generation' },
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Examples', link: '/examples' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Michael-Nussbaumer/nuxt-directus-module' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@michael-nussbaumer/nuxt-directus' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Michael Nussbaumer'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/Michael-Nussbaumer/nuxt-directus-module/edit/main/docs-site/:path',
      text: 'Edit this page on GitHub'
    }
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '@michael-nussbaumer/nuxt-directus' }],
    ['meta', { property: 'og:description', content: 'Production-ready Nuxt 4 module for Directus SDK integration' }],
  ],

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
