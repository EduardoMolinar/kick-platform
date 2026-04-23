import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:shell',
              onlyDependOnLibsWithTags: ['type:ui', 'type:types', 'type:util', 'type:feature'],
            },
            {
              sourceTag: 'type:remote',
              onlyDependOnLibsWithTags: ['type:ui', 'type:types', 'type:util', 'type:feature'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:ui', 'type:types', 'type:util'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:types', 'type:util'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util', 'type:types'],
            },
            {
              sourceTag: 'type:types',
              onlyDependOnLibsWithTags: ['type:types'],
            },
            {
              sourceTag: 'scope:home',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system', 'scope:home'],
            },
            {
              sourceTag: 'scope:live',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system', 'scope:live'],
            },
            {
              sourceTag: 'scope:competition',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system', 'scope:competition'],
            },
            {
              sourceTag: 'scope:team',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system', 'scope:team'],
            },
            {
              sourceTag: 'scope:profile',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system', 'scope:profile'],
            },
            {
              sourceTag: 'scope:design-system',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
];
