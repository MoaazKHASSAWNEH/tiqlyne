import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'getting-started',
    'installation',
    'core-concepts',

    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/package-boundaries',
        'architecture/execution-pipeline',
        'architecture/v0-1-0-boundaries'
      ]
    },

    {
      type: 'category',
      label: 'Packages',
      items: ['packages/motion-core', 'packages/motion-web', 'packages/motion-pack-basic']
    },

    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/engine-setup',
        'guides/registered-motions',
        'guides/basic-motions',
        'guides/direct-timelines',
        'guides/multiple-tracks-and-steps',
        'guides/labels',
        'guides/compositions',
        'guides/playback-controllers',
        'guides/events',
        'guides/diagnostics',
        'guides/sampler',
        'guides/inspector',
        'guides/reduced-motion',
        'guides/custom-motion-definition',
        'guides/custom-motion-driver'
      ]
    },

    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/motion-engine',
        'reference/motion-config',
        'reference/motion-definition',
        'reference/motion-timeline',
        'reference/motion-composition',
        'reference/motion-driver',
        'reference/playback-controller',
        'reference/playback-result',
        'reference/diagnostics',
        'reference/events',
        'reference/public-exports'
      ]
    },

    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/vanilla',
        'examples/fade-in',
        'examples/fade-out',
        'examples/slide-in',
        'examples/direct-timeline',
        'examples/composition',
        'examples/playback-controller'
      ]
    },

    {
      type: 'category',
      label: 'Release',
      items: [
        'release/status',
        'release/v0-1-0',
        'release/limitations',
        'release/roadmap',
        'release/npm-publication'
      ]
    }
  ]
};

export default sidebars;
