module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'always', ['lower-case', 'kebab-case', 'snake-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
  },
};
