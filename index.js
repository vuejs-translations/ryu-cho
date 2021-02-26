const Rss = require('rss-parser')
const Queue = require('queue')
const Github = require('./lib/github')
const Repo = require('./lib/repository')
const Utility = require('./lib/utility')

const remote = {
  upstream: {
    url: process.env.UPSTREAM_REPO_URL,
    owner: Utility.extractRepoOwner(process.env.UPSTREAM_REPO_URL),
    name: Utility.extractRepoName(process.env.UPSTREAM_REPO_URL),
    defaultBranch: process.env.UPSTREAM_REPO_DEFAULT_BRANCH
  },
  head: {
    url: process.env.HEAD_REPO_URL,
    owner: Utility.extractRepoOwner(process.env.HEAD_REPO_URL),
    name: Utility.extractRepoName(process.env.HEAD_REPO_URL),
    defaultBranch: process.env.HEAD_REPO_DEFAULT_BRANCH
  }
}

const rss = new Rss()
const github = new Github(process.env.GITHUB_ACCESS_TOKEN)
const q = Queue({ autostart: true, concurrency: 1 })

const repo = new Repo({
  path: 'repo',
  remote,
  user: {
    name: process.env.GITHUB_USER_NAME,
    email: process.env.GITHUB_EMAIL
  }
})

function setup() {
  repo.setup()
  processHeadFeed()
}

async function processHeadFeed() {
  const [run, feed] = await Promise.all([
    github.getLatestWorkflowRun(remote),
    getFeed()
  ])

  const runDate = new Date(run.created_at).toISOString()

  feed.items.forEach(async (item) => {
    if (runDate > item.isoDate) {
      return
    }

    Utility.log('I', `New commit on head repo: ${item.contentSnippet}`)

    const hash = Utility.extractBasename(item.link)

    // branch names consisting of 40 hex characters are not allowed
    const shortHash = hash.substr(0, 8)

    if (repo.existsRemoteBranch(shortHash)) {
      Utility.log('W', `${item.contentSnippet}: Remote branch already exists`)
      return
    }

    const { data: result } = await github.searchIssue(remote, { hash })

    const issueNo = await getIssueNo(item, hash)

    q.push(async () => {
      try {
        q.stop()

        repo.fetchHead()
        repo.updateDefaultBranch()
        repo.deleteOldBranch(shortHash)
        repo.createNewBranch(shortHash)

        if (repo.hasConflicts('cherry-pick', hash)) {
          Utility.log('W', `${item.title}: Conflicts occurred. Please make a pull request by yourself`)
          repo.resetChanges()
        } else {
          Utility.log('S', `${item.title}: Fully merged`)
          repo.updateRemote(shortHash)
          await after(item, shortHash, issueNo)
        }
      } catch (e) {
        throw e
      } finally {
        q.start()
      }
    })
  })
}

function getFeed() {
  const repoUrl = process.env.HEAD_REPO_URL
  const repoBranch = process.env.HEAD_REPO_DEFAULT_BRANCH

  return rss.parseURL(`${repoUrl}/commits/${repoBranch}.atom`)
}

async function getIssueNo(item, hash) {
  const { data: result } = await github.searchIssue(remote, { hash })

  if (result.total_count > 0) {
    return result.items[0].number
  }

  const body = `New updates on head repo :page_facing_up:\r\nOriginal:${item.link}`

  const { data: newIssue } = await github.createIssue(remote, {
    title: `[Doc]: ${Utility.removeHash(item.contentSnippet)}`,
    body,
    labels: ['documentation']
  })

  Utility.log('S', `${item.contentSnippet}: Issue created: ${newIssue.html_url}`)

  return newIssue.number
}

const after = async (item, shortHash, issueNo = null) => {
  const body = issueNo
    ? `resolves #${issueNo}\r\nCherry picked from ${item.link}`
    : `Cherry picked from ${item.link}`

  const { data: pullRequest } = await github.createPullRequest(remote, {
    title: Utility.removeHash(item.title),
    body,
    branch: shortHash
  })

  if (!pullRequest) {
    return
  }

  Utility.log('S', `Created new pull request: ${pullRequest.html_url}`)
}

process.on('unhandledRejection', err => { Utility.log('E', err) })

setup()
