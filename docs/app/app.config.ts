export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
  seo: {
    siteName: '@michael-nussbaumer/nuxt-directus'
  },
  header: {
    title: 'nuxt-directus',
    to: '/',
    logo: {
      alt: 'Nuxt Directus',
      light: '/logo.svg',
      dark: '/logo.svg'
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/Michael-Nussbaumer/nuxt-directus-module',
      'target': '_blank',
      'aria-label': 'GitHub'
    }, {
      'icon': 'i-simple-icons-npm',
      'to': 'https://www.npmjs.com/package/@michael-nussbaumer/nuxt-directus',
      'target': '_blank',
      'aria-label': 'NPM'
    }]
  },
  footer: {
    credits: `MIT License © ${new Date().getFullYear()} Michael Nussbaumer`,
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/Michael-Nussbaumer/nuxt-directus-module',
      'target': '_blank',
      'aria-label': 'GitHub'
    }, {
      'icon': 'i-simple-icons-npm',
      'to': 'https://www.npmjs.com/package/@michael-nussbaumer/nuxt-directus',
      'target': '_blank',
      'aria-label': 'NPM'
    }]
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Links',
      edit: 'https://github.com/Michael-Nussbaumer/nuxt-directus-module/edit/main/docs',
      links: [{
        icon: 'i-lucide-star',
        label: 'Star on GitHub',
        to: 'https://github.com/Michael-Nussbaumer/nuxt-directus-module',
        target: '_blank'
      }, {
        icon: 'i-simple-icons-npm',
        label: 'View on NPM',
        to: 'https://www.npmjs.com/package/@michael-nussbaumer/nuxt-directus',
        target: '_blank'
      }]
    }
  }
})
