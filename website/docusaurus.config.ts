import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const repositoryUrl = 'https://github.com/MoaazKHASSAWNEH/motion-engine';

const config: Config = {
  title: 'Tiqlyne Motion Engine',
  tagline: 'Framework-agnostic TypeScript motion engine.',
  favicon: 'img/favicon.ico',
  url: 'https://moaazkhassawneh.github.io',
  baseUrl: '/motion-engine/',
  organizationName: 'MoaazKHASSAWNEH',
  projectName: 'motion-engine',
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
        blog: false,
        theme: { customCss: './src/css/custom.css' }
      } satisfies Preset.Options
    ]
  ],
  themeConfig: {
    metadata: [{ name: 'keywords', content: 'TypeScript, motion, animation, Web Animations API' }],
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: 'Tiqlyne Motion Engine',
      logo: { alt: 'Tiqlyne Motion Engine logo', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
        { href: repositoryUrl, label: 'GitHub', position: 'right' }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting started', to: '/docs/getting-started' },
            { label: 'API reference', to: '/docs/reference/public-exports' },
            { label: 'Release status', to: '/docs/release/status' }
          ]
        },
        {
          title: 'Packages',
          items: [
            { label: 'motion-core', to: '/docs/packages/motion-core' },
            { label: 'motion-web', to: '/docs/packages/motion-web' },
            { label: 'motion-pack-basic', to: '/docs/packages/motion-pack-basic' }
          ]
        },
        {
          title: 'Project',
          items: [
            { label: 'GitHub', href: repositoryUrl },
            { label: 'Roadmap', to: '/docs/release/roadmap' },
            { label: 'Limitations', to: '/docs/release/limitations' }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Tiqlyne Motion Engine.`
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula }
  } satisfies Preset.ThemeConfig
};

export default config;
