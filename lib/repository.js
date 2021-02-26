const shell = require('shelljs')
const Git = require('./git')

shell.config.silent = true

class Repository {
  constructor({ path = '.', remote, user }) {
    this.path = path
    this.remote = remote
    this.user = user
  }

  setup() {
    shell.cd(this.path)
    Git.exec(`clone ${this.remote.upstream.url} ${this.remote.upstream.name}`)
    shell.cd(this.remote.upstream.name)
    Git.exec(`remote add ${this.remote.head.name} ${this.remote.head.url}`)
    Git.exec(`config user.name "${this.user.name}"`)
    Git.exec(`config user.email "${this.user.email}"`)
    Git.exec('branch | grep -v "*" | xargs git branch -D')
  }

  fetchHead() {
    Git.fetch(this.remote.head.name, this.remote.head.defaultBranch)
  }

  updateDefaultBranch() {
    this.checkoutDefaultBranch()
    this.mergeUpstream()
  }

  mergeUpstream() {
    Git.merge(`${this.remote.upstream.name}/${this.remote.upstream.defaultBranch}`)
  }

  checkoutDefaultBranch() {
    Git.checkout(this.remote.upstream.defaultBranch)
  }

  updateRemote(branchName) {
    Git.push('origin', branchName)
  }

  resetChanges() {
    Git.exec('reset --hard')
  }

  existsRemoteBranch(branchName) {
    return Git.exec(`branch -a | grep -c remotes/origin/${branchName}`).stdout.replace('\n', '') === '1'
  }

  deleteOldBranch(branchName) {
    return Git.exec(`branch -D ${branchName}`)
  }

  createNewBranch(branchName) {
    return Git.checkout(branchName, '-b')
  }

  hasConflicts(command, target, option) {
    return command === 'cherry-pick'
      ? Git.cherryPick(target, option).code !== 0
      : Git.merge(target).code !== 0
  }
}

module.exports = Repository
