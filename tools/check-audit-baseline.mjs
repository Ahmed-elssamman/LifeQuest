import { spawnSync } from 'node:child_process';

// These high advisories are confined to development tools in the pinned lockfile.
// npm currently offers only incompatible major downgrades for their roots.
const knownPackages = new Set([
  '@nx/angular',
  '@nx/module-federation',
  '@nx/rspack',
  '@nx/web',
  '@nx/webpack',
  '@rspack/dev-server',
  'braces',
  'chokidar',
  'fast-glob',
  'globby',
  'http-proxy-middleware',
  'micromatch',
  'node-forge',
  'selfsigned',
  'ts-checker-rspack-plugin',
  'tsc-alias',
  'webpack-dev-server',
]);
const knownAdvisories = new Set([
  'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
  'https://github.com/advisories/GHSA-86w9-cpqp-85rv',
]);

const result = spawnSync('npm', ['audit', '--json'], {
  encoding: 'utf8',
  timeout: 30000,
  maxBuffer: 10 * 1024 * 1024,
});
if (result.error || (result.status !== 0 && result.status !== 1))
  throw new Error('Full dependency audit could not be completed.');

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  throw new Error('Full dependency audit returned invalid JSON.');
}
if (report.error || !report.vulnerabilities || !report.metadata?.vulnerabilities)
  throw new Error('Full dependency audit did not return vulnerability data.');

function advisoryUrls(name, visited = new Set()) {
  if (visited.has(name)) return [];
  visited.add(name);
  const vulnerability = report.vulnerabilities[name];
  if (!vulnerability) return [];
  return vulnerability.via.flatMap((item) =>
    typeof item === 'string'
      ? advisoryUrls(item, visited)
      : typeof item.url === 'string'
        ? [item.url]
        : [],
  );
}

const elevated = Object.entries(report.vulnerabilities).filter(([, vulnerability]) =>
  ['high', 'critical'].includes(vulnerability.severity),
);
const unexpected = elevated
  .filter(([name]) => {
    const urls = advisoryUrls(name);
    return (
      !knownPackages.has(name) || !urls.length || urls.some((url) => !knownAdvisories.has(url))
    );
  })
  .map(([name]) => name);
if (report.metadata.vulnerabilities.critical || unexpected.length) {
  console.error('Unexpected high or critical dependency advisories:', unexpected.join(', '));
  process.exitCode = 1;
} else {
  console.log(
    `Full audit: ${elevated.length} known high development-tool advisories; no new high or critical advisories. Production dependencies are checked separately.`,
  );
}
