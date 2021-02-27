import { log, extractBasename, removeHash } from './utils'
import { Config, Remote } from './config'
import { Rss } from './rss'
import { GitHub } from './github'
import { Repository } from './repository'

interface Feed {
  link: string
  contentSnippet: string
  isoDate: string
}

export class CheTsumi {
  config: Config

  upstream: Remote

  head: Remote

  rss: Rss

  github: GitHub

  repo: Repository

  constructor(config: Config) {
    this.config = config
    this.upstream = config.remote.upstream
    this.head = config.remote.head

    this.rss = new Rss()

    this.github = new GitHub(config.accessToken)

    this.repo = new Repository({
      path: 'repo',
      userName: config.userName,
      email: config.email,
      upstream: this.upstream,
      head: this.head
    })
  }

  async start(): Promise<void> {
    this.repo.setup()

    const run = await this.getRun()
    const feed = await this.getFeed()

    for (const i in feed) {
      await this.processFeed(feed[i] as Feed, run)
    }
  }

  protected async getRun() {
    const run = await this.github.getLatestRun(
      this.upstream,
      this.config.workflowName
    )

    return new Date(run.created_at).toISOString()
  }

  protected async getFeed() {
    return this.rss.get(this.head, this.config.trackFrom)
  }

  protected async processFeed(feed: Feed, run: string) {
    // Skip any feed which is older than the last run.
    if (run > feed.isoDate) {
      return
    }

    log('I', `New commit on head repo: "${feed.contentSnippet}"`)

    const hash = extractBasename(feed.link)

    // branch names consisting of 40 hex characters are not allowed
    const shortHash = hash.substr(0, 8)

    // If the branch already exists on the upstream repo, then this feed is
    // already handled. Let's stop here.
    if (this.repo.branchExists(shortHash)) {
      log('W', 'Branch already exists')
      return
    }

    const issueNo = await this.createIssueIfNot(feed, hash)

    // If `issueNo` is `null`, that means issue already exists. Stop here.
    if (issueNo === null) {
      log('W', 'Issue already exists')
      return
    }

    await this.createPullRequest(hash, shortHash, feed, issueNo)
  }

  protected async createIssueIfNot(feed: Feed, hash: string) {
    const res = await this.github.searchIssue(this.upstream, hash)

    return res.data.total_count > 0 ? null : this.createIssue(feed)
  }

  protected async createIssue(feed: Feed) {
    const title = removeHash(feed.contentSnippet)
    const body = `New updates on head repo.\r\n${feed.link}`

    const res = await this.github.createIssue(this.upstream, {
      title,
      body
    })

    log('S', `Issue created: ${res.data.html_url}`)

    return res.data.number
  }

  protected async createPullRequest(
    hash: string,
    shortHash: string,
    feed: Feed,
    issueNo: number
  ) {
    this.repo.fetchHead()
    this.repo.updateDefaultBranch()
    this.repo.deleteBranch(shortHash)
    this.repo.createBranch(shortHash)
console.log('hash')
    if (this.repo.hasConflicts(hash)) {
      log('W', 'Conflicts occurred. Please make a pull request by yourself.')
      this.repo.reset()
      return
    }

    log('S', `Successfully Fully merged`)

    this.repo.updateRemote(shortHash)

    const title = `${ removeHash(feed.contentSnippet) } (#${issueNo})`
    const body = `resolves #${issueNo}\r\nCherry picked from ${feed.link}`
    const branch = shortHash

    const res = await this.github.createPullRequest(this.upstream, {
      title,
      body,
      branch
    })

    if (!res.data) {
      return
    }

    log('S', `Created new pull request: ${res.data.html_url}`)
  }
}
