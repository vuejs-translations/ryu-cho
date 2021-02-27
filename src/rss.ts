import RssParser from 'rss-parser'
import { extractBasename } from './utils'
import { Remote } from './config'

export class Rss {
  api: RssParser

  constructor() {
    this.api = new RssParser()
  }

  async get(remote: Remote, from: string) {
    const url = remote.url
    const branch = remote.branch
    console.log(`${url}/commits/${branch}.atom`)

    const feed = await this.api.parseURL(`${url}/commits/${branch}.atom`)
console.log('feed-api', feed)
    const target = feed.items.findIndex((item) => {
      return extractBasename(item.link!) === from
    })

    return feed.items.slice(0, target + 1)
  }
}
