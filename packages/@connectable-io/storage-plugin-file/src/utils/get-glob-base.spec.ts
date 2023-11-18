import { describe, expect, test } from 'vitest'
import { getGlobBase } from './get-glob-base.js'

describe('getGlobBase', () => {
  test.each([
    { pattrn: 'foo/bar/*.js', expected: 'foo/bar/' },
    { pattrn: 'foo/bar/**/*.js', expected: 'foo/bar/' },
    { pattrn: 'foo/bar/**/baz/*.js', expected: 'foo/bar/' },
    { pattrn: 'foo/bar/**/baz/**/*.js', expected: 'foo/bar/' },
    { pattrn: 'foo/bar/foo*.js', expected: 'foo/bar/' },
    { pattrn: 'foo/bar/foo[0-9].js', expected: 'foo/bar/' },
  ])('should return the base directory "$expected" for the given glob pattern "$pattrn"', ({ pattrn, expected }) => {
    expect(getGlobBase(pattrn)).toBe(expected)
  })
})
