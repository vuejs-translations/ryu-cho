import * as Utils from 'src/utils'
import { describe, it, expect } from 'vitest'

describe('utils', () => {
  const https = 'https://github.com/vuejs/vuejs.org'
  const git = 'git@github.com:vuejs/vuejs.org'

  describe('#extractBasename', () => {
    it('extracts the basename from the given url', () => {
      const basename = 'vuejs.org'

      expect(Utils.extractBasename(https)).toBe(basename)
      expect(Utils.extractBasename(git)).toBe(basename)
    })
  })

  describe('#extractRepoName', () => {
    it('extracts repo name from the given url', () => {
      const repo = 'vuejs.org'

      expect(Utils.extractRepoName(https + '.git')).toBe(repo)
      expect(Utils.extractRepoName(git + '.git')).toBe(repo)
    })
  })

  describe('#extractRepoOwner', () => {
    it(`extracts repo owner from the given url`, () => {
      const owner = 'vuejs'

      expect(Utils.extractRepoOwner(https)).toBe(owner)
      expect(Utils.extractRepoOwner(git)).toBe(owner)
    })
  })

  describe('#removeHash', () => {
    it('returns the text with hash removed', () => {
      expect(Utils.removeHash('Text which contains hash with space (#110)'))
        .toBe('Text which contains hash with space')

      expect(Utils.removeHash('Text which contains hash with no space(#110)'))
        .toBe('Text which contains hash with no space')

      expect(Utils.removeHash('Text which does not contain hash'))
        .toBe('Text which does not contain hash')
    })
  })
})
