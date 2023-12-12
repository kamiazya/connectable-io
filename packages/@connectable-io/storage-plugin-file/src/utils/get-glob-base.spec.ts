import { describe, expect, test } from 'vitest'
import { getGlobBase } from './get-glob-base.js'

describe('getGlobBase', () => {
  test.each([
    { pattern: 'foo/bar/*.js', expected: 'foo/bar/' },
    { pattern: 'foo/bar/**/*.js', expected: 'foo/bar/' },
    { pattern: 'foo/bar/**/baz/*.js', expected: 'foo/bar/' },
    { pattern: 'foo/bar/**/baz/**/*.js', expected: 'foo/bar/' },
    { pattern: 'foo/bar/foo*.js', expected: 'foo/bar/' },
    { pattern: 'foo/bar/foo[0-9].js', expected: 'foo/bar/' },
  ])('should return the base directory "$expected" for the given glob pattern "$pattern"', ({ pattern, expected }) => {
    expect(getGlobBase(pattern)).toBe(expected)
  })
})
