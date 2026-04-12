export default {
  displayName: 'shared-utils',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/libs/shared-utils',
  transform: {
    '^.+\\.(ts|js)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
};
