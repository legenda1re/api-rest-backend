module.exports = {
  include: ['src/**/*.js'],
  exclude: ['src/config/**', 'src/workers/**'],
  reporter: ['text', 'lcov', 'html'],
  'check-coverage': true,
  branches: 80,
  lines: 80,
  functions: 80,
  statements: 80,
};
