module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", ["text", {"skipFull": true}]],
  testSequencer: "./test/testSequencer.js"
};
