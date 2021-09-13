export default {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'clover'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
