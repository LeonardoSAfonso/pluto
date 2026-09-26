module.exports = {
  ...require('./jest.config.js'),
  testRegex: '\\.integration\\.spec\\.ts$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testTimeout: 60000,
};
