module.exports = {
  preset: 'ts-jest',
  rootDir: __dirname,
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/']
}
