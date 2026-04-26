import { execFileSync } from 'node:child_process';

const branchName =
  process.argv[2] ??
  execFileSync('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim();

const branchPattern =
  /^(feat|fix|chore|docs|refactor|test|build|ci|perf|style|revert)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!branchName) {
  process.exit(0);
}

if (!branchPattern.test(branchName)) {
  console.error(`Invalid branch name: "${branchName}"`);
  console.error('Expected format: <type>/<short-kebab-case-description>');
  console.error(
    'Allowed types: feat, fix, chore, docs, refactor, test, build, ci, perf, style, revert',
  );
  console.error('Examples:');
  console.error('  feat/add-health-metrics');
  console.error('  fix/handle-missing-port');
  console.error('  chore/update-eslint-config');
  console.error('  docs/add-contributing-guide');
  process.exit(1);
}
