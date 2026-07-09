import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import { packageVersionSummary } from '@site/src/data/packageVersions';
import styles from './styles.module.css';

const packages = [
  {
    name: '@tiqlyne/motion-core',
    text: 'Define, validate, plan, sample, and inspect motion without depending on the DOM.'
  },
  {
    name: '@tiqlyne/motion-web',
    text: 'Resolve DOM targets and execute timelines with the Web Animations API.'
  },
  {
    name: '@tiqlyne/motion-pack-basic',
    text: 'Start with fade-in, fade-out, and slide-in motion definitions.'
  }
];

const reasons = [
  [
    'Framework agnostic',
    'Use the same engine contracts from vanilla TypeScript or any UI framework.'
  ],
  ['Accessible motion', 'Choose skip, simplify, or preserve behavior when reduced motion applies.'],
  [
    'Testable by design',
    'Plan and inspect timelines with no browser playback, or use the bundled test driver.'
  ],
  [
    'Typed and extensible',
    'Create custom definitions and drivers against explicit public contracts.'
  ]
] as const;

const paths = [
  {
    title: 'Learn step by step',
    text: 'Build your first animation, then progress through targets, controls, and extension points.',
    to: '/docs/tutorials'
  },
  {
    title: 'Copy an example',
    text: 'Start from complete browser examples for common animations and runtime behavior.',
    to: '/docs/examples'
  },
  {
    title: 'Explore a guide',
    text: 'Go deeper on timelines, runtime behavior, tooling, extensibility, and troubleshooting.',
    to: '/docs/guides'
  },
  {
    title: 'Look up an API',
    text: 'Find exact signatures, normalized defaults, reasons, diagnostics, and limitations.',
    to: '/docs/reference'
  },
  {
    title: 'Contribute',
    text: 'Use repository-specific development, testing, documentation, and release instructions.',
    to: '/docs/project'
  }
] as const;

export default function HomepageFeatures(): ReactNode {
  return (
    <>
      <section className={`${styles.section} ${styles.tinted}`}>
        <div className="container">
          <Heading as="h2">Choose your path</Heading>
          <p className={styles.lead}>Go directly to the kind of help you need.</p>
          <div className={styles.grid}>
            {paths.map((item) => (
              <Link className={styles.pathCard} to={item.to} key={item.title}>
                <Heading as="h3">{item.title}</Heading>
                <p>{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <Heading as="h2">Core, Web, and a focused basic pack</Heading>
          <p className={styles.lead}>
            Three packages keep authoring, execution, and presets separate.
          </p>
          <div className={styles.grid}>
            {packages.map((item) => (
              <article className={styles.card} key={item.name}>
                <code>{item.name}</code>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.tinted}`}>
        <div className="container">
          <Heading as="h2">Why Tiqlyne Motion Engine?</Heading>
          <div className={styles.grid}>
            {reasons.map(([title, text]) => (
              <article className={styles.reason} key={title}>
                <Heading as="h3">{title}</Heading>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`container ${styles.release}`}>
          <div>
            <span className={styles.kicker}>{packageVersionSummary}</span>
            <Heading as="h2">A practical foundation, with honest boundaries.</Heading>
          </div>
          <p>
            Build registered motions, direct timelines, compositions, playback controllers, and
            accessible browser playback today. The documentation clearly separates shipped APIs from
            roadmap items.
          </p>
        </div>
      </section>
    </>
  );
}
