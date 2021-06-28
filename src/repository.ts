import shell from 'shelljs'
import { Remote } from './config'
import { Git } from './git'

shell.config.silent = true

export interface Options {
  path?: string
  token: string
  userName: string
  email: string
  upstream: Remote
  head: Remote
}

export class Repository {
  path: string
  token: string
  userName: string
  email: string
  upstream: Remote
  head: Remote
  git: Git

  constructor(options: Options) {
    this.path = options.path ?? '.'
    this.token = options.token
    this.userName = options.userName
    this.email = options.email
    this.upstream = options.upstream
    this.head = options.head

    this.git = new Git()
  }

  setup() {
    shell.cd(this.path)
    this.git.clone(
      this.userName,
      this.token,
      this.upstream.url,
      this.upstream.name
    )
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

  checkoutDefaultBranch() {
    this.git.checkout(this.upstream.branch)
  }

  updateRemote(branch: string) {
    this.git.push('origin', branch)
  }

  createBranch(branch: string) {
    this.git.checkout(branch, '-b')
  }

  hasConflicts(hash: string) {
    return (this.git.cherryPick(hash) as any).code !== 0
  }

  reset() {
    this.git.reset()
  }
}
