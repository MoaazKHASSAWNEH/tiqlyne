import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import { packageVersionSummary } from '@site/src/data/packageVersions';
import styles from './index.module.css';

function HomepageHeader(): ReactNode {
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <img
          className={styles.heroLogo}
          src="/tiqlyne/img/logo.png"
          alt="Tiqlyne Motion Engine logo"
        />
        <span className={styles.eyebrow}>{packageVersionSummary}</span>
        <Heading as="h1" className={styles.heroTitle}>
          Motion you can describe, inspect, and run anywhere.
        </Heading>
        <p className={styles.heroSubtitle}>
          Tiqlyne Motion Engine is a strongly typed, framework-agnostic TypeScript engine with a
          DOM-independent core and an official Web Animations API driver.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/getting-started">
            Get started
          </Link>
          <Link className="button button--secondary button--lg" href="https://github.com/MoaazKHASSAWNEH/tiqlyne">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Framework-agnostic TypeScript motion engine"
      description="Build typed timelines, reusable motions, and accessible browser animations with Tiqlyne Motion Engine."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
