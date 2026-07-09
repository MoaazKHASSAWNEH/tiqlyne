import type { ReactNode } from 'react';
import { packageVersionRows, packageVersions } from '@site/src/data/packageVersions';

export default function PackageVersionsTable(): ReactNode {
  return (
    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Current version</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {packageVersionRows.map((item) => (
          <tr key={item.name}>
            <td>
              <code>{item.name}</code>
            </td>
            <td>
              <code>{packageVersions[item.name]}</code>
            </td>
            <td>{item.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
