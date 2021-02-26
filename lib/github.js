const { Octokit } = require('@octokit/rest')

class GitHub {
  constructor(token) {
    this.github = new Octokit({ auth: token })
  }

  async getLatestWorkflowRun(remote) {
    const res = await this.github.actions.listWorkflowRunsForRepo({
      owner: remote.upstream.owner,
      repo: remote.upstream.name
    })

    return res.data.workflow_runs[0]
  }

  createIssue(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.issues.create({
        owner: remote.upstream.owner,
        repo: remote.upstream.name,
        title: params.title,
        body: params.body,
        labels: params.labels,
      })
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }

  closeIssue(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.issues.edit({
        owner: remote.upstream.owner,
        repo: remote.upstream.name,
        number: params.number,
        state: 'closed',
      })
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }

  addLabels(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.issues.addLabels({
        owner: remote.upstream.owner,
        repo: remote.upstream.name,
        number: params.number,
        labels: params.labels,
      })
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }

  searchIssue(remote, params = {}) {
    return this.github.search.issuesAndPullRequests({
      q: `${params.hash} repo:${remote.upstream.owner}/${remote.upstream.name} type:issue`,
    })
  }

  createPullRequest(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.pulls.create({
        owner: remote.upstream.owner,
        repo: remote.upstream.name,
        title: params.title,
        body: params.body,
        head: `${remote.upstream.owner}:${params.branch}`,
        base: remote.upstream.defaultBranch,
      })
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }

  closePullRequest(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.pullRequests.update({
        owner: remote.upstream.owner,
        repo: remote.upstream.name,
        number: params.number,
        state: 'closed',
      })
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }

  assignReviewers(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.pullRequests.createReviewRequest({
        owner: remote.upstream.owner,
        repo: remote.upstream.name,
        number: params.number,
        reviewers: params.reviewers,
      })
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }
}

module.exports = GitHub
