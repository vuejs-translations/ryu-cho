import shell from 'shelljs'
import { Remote } from './config'
import { Git } from './git'

shell.config.silent = true

export interface Options {
  path?: string
  upstream: Remote
  head: Remote
  userName: string
  email: string
}

export class Repository {
  path: string

  userName: string

  email: string

  upstream: Remote

  head: Remote

  git: Git

  constructor(options: Options) {
    this.path = options.path ?? '.'
    this.userName = options.userName
    this.email = options.email
    this.upstream = options.upstream
    this.head = options.head

    this.git = new Git()
  }

  setup() {
    shell.cd(this.path)
    this.git.clone(this.upstream.url, this.upstream.name)
    shell.cd(this.upstream.name)
    this.git.addRemote(this.head.url, this.head.name)
    this.git.config('user.name', `"${this.userName}"`)
    this.git.config('user.email', `"${this.email}"`)
  }

  fetchHead() {
    this.git.fetch(this.head.name, this.head.branch)
  }

  branchExists(branch: string) {
    const cmd = `branch -a | grep -c remotes/origin/${branch}`
    const stdout = this.git.exec(cmd).stdout as string

    return stdout.replace('\n', '') === '1'
  }

  updateDefaultBranch() {
    this.checkoutDefaultBranch()
    this.mergeUpstream()
  }

  checkoutDefaultBranch() {
    this.git.checkout(this.upstream.branch)
  }

  mergeUpstream() {
    this.git.merge(`${this.upstream.name}/${this.upstream.branch}`)
  }

  updateRemote(branch: string) {
    this.git.push('origin', branch)
  }

  createBranch(branch: string) {
    this.git.checkout(branch, '-b')
  }

  deleteBranch(branch: string) {
    this.git.branch(branch, '-D')
  }

  hasConflicts(hash: string) {
    const r = (this.git.cherryPick(hash) as any)
    console.log(r)
    return r.code !== 0
  }

  reset() {
    this.git.reset()
  }
}
