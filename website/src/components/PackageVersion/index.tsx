import type { ReactNode } from 'react';
import {
  packageVersions,
  type TiqlynePackageName
} from '@site/src/data/packageVersions';

type PackageVersionProps = {
  name: TiqlynePackageName;
};

export default function PackageVersion({ name }: PackageVersionProps): ReactNode {
  return <code>{packageVersions[name]}</code>;
}
