import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const repositoryUrl = 'https://github.com/MoaazKHASSAWNEH/tiqlyne';

const config: Config = {
  title: 'Tiqlyne Motion Engine',
  tagline: 'Framework-agnostic TypeScript motion engine.',
  favicon: 'img/favicon.ico',
  url: 'https://moaazkhassawneh.github.io',
  baseUrl: '/tiqlyne/',
  organizationName: 'MoaazKHASSAWNEH',
  projectName: 'tiqlyne',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: { mermaid: true },
  themes: ['@docusaurus/theme-mermaid'],
  future: { v4: true },
  i18n: { defaultLocale: 'en', locales: ['en'] },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `${repositoryUrl}/edit/main/website/`
        },
        blog: {
          showReadingTime: true,
          onUntruncatedBlogPosts: 'ignore',
          editUrl: `${repositoryUrl}/edit/main/website/`
        },
        theme: { customCss: './src/css/custom.css' }
      } satisfies Preset.Options
    ]
  ],
  themeConfig: {
    metadata: [{ name: 'keywords', content: 'TypeScript, motion, animation, Web Animations API' }],
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: 'Tiqlyne Motion Engine',
      logo: { alt: 'Tiqlyne Motion Engine logo', src: 'img/logo.png' },
      items: [
        { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
        { type: 'docSidebar', sidebarId: 'tutorials', position: 'left', label: 'Tutorials' },
        { type: 'docSidebar', sidebarId: 'guides', position: 'left', label: 'Guides' },
        { type: 'docSidebar', sidebarId: 'examples', position: 'left', label: 'Examples' },
        { type: 'docSidebar', sidebarId: 'reference', position: 'left', label: 'API Reference' },
        {
          type: 'dropdown',
          label: 'More',
          position: 'left',
          items: [
            { to: '/blog', label: 'Blog' },
            { to: '/docs/project', label: 'Project' }
          ]
        },
        { href: repositoryUrl, label: 'GitHub', position: 'right' }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            { label: 'Getting started', to: '/docs/getting-started' },
            { label: 'Tutorials', to: '/docs/tutorials' },
            { label: 'Guides', to: '/docs/guides' },
            { label: 'Examples', to: '/docs/examples' }
          ]
        },
        {
          title: 'API',
          items: [
            { label: 'API Reference', to: '/docs/reference' },
            { label: 'MotionEngine', to: '/docs/reference/motion-engine' },
            { label: 'WebMotionDriver', to: '/docs/reference/web-motion-driver' },
            { label: 'Basic pack', to: '/docs/reference/basic-pack' }
          ]
        },
        {
          title: 'Project',
          items: [
            { label: 'Architecture', to: '/docs/architecture/overview' },
            { label: 'Roadmap', to: '/docs/release/roadmap' },
            { label: 'Blog', to: '/blog' },
            { label: 'GitHub', href: repositoryUrl }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Tiqlyne Motion Engine.`
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula }
  } satisfies Preset.ThemeConfig
};

export default config;
