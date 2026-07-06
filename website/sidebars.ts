import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'start/intro',
    'start/getting-started',
    'start/installation',
    'start/core-concepts',
    'start/learning-path',
    {
      type: 'category',
      label: 'Packages',
      collapsed: true,
      items: ['packages/motion-core', 'packages/motion-web', 'packages/motion-pack-basic']
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: true,
      items: [
        'guides/index',
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
        'guides/custom-motion-driver',
        'guides/troubleshooting',
        'guides/recipes'
      ]
    }
  ],

  tutorials: [
    'tutorials/index',
    {
      type: 'category',
      label: 'Beginner',
      items: ['tutorials/first-animation', 'tutorials/web-engine-setup', 'tutorials/animate-a-card']
    },
    {
      type: 'category',
      label: 'Intermediate',
      items: [
        'tutorials/child-targets',
        'tutorials/staggered-list',
        'tutorials/composition',
        'tutorials/playback-controls',
        'tutorials/reduced-motion'
      ]
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'tutorials/diagnostics-debugging',
        'tutorials/custom-motion-definition',
        'tutorials/custom-driver'
      ]
    }
  ],

  examples: [
    'examples/index',
    {
      type: 'category',
      label: 'Basic animations',
      items: ['examples/fade-in', 'examples/fade-out', 'examples/slide-in']
    },
    {
      type: 'category',
      label: 'Targets',
      items: ['examples/child-targets', 'examples/stagger-list']
    },
    {
      type: 'category',
      label: 'Timelines',
      items: ['examples/direct-timeline', 'examples/multiple-tracks', 'examples/labels']
    },
    {
      type: 'category',
      label: 'Runtime behavior',
      items: [
        'examples/composition',
        'examples/playback-controller',
        'examples/reduced-motion',
        'examples/diagnostics'
      ]
    }
  ],

  reference: [
    'reference/index',
    'reference/public-exports',
    {
      type: 'category',
      label: 'Core',
      items: [
        'reference/motion-engine',
        'reference/motion-registry',
        'reference/motion-config',
        'reference/motion-definition',
        'reference/motion-options',
        'reference/motion-timeline',
        'reference/timeline-builder',
        'reference/motion-composition',
        'reference/composition-builder'
      ]
    },
    {
      type: 'category',
      label: 'Runtime',
      items: [
        'reference/motion-driver',
        'reference/web-motion-driver',
        'reference/motion-targets',
        'reference/playback-controller',
        'reference/playback-result'
      ]
    },
    {
      type: 'category',
      label: 'Debugging and policies',
      items: [
        'reference/diagnostics',
        'reference/events',
        'reference/sampler',
        'reference/inspector',
        'reference/reduced-motion',
        'reference/conflict-strategy'
      ]
    },
    {
      type: 'category',
      label: 'Packs',
      items: ['reference/basic-pack']
    }
  ],

  project: [
    'project/index',
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/design-principles',
        'architecture/package-boundaries',
        'architecture/execution-pipeline',
        'architecture/v0-1-0-boundaries'
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
        'release/api-stability',
        'release/versioning'
      ]
    },
    {
      type: 'category',
      label: 'Maintainers',
      items: [
        'project/local-development',
        'project/internal-vanilla-example',
        'project/testing',
        'project/build-docs',
        'project/npm-publication'
      ]
    }
  ]
};

export default sidebars;
