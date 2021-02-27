import shell, { ExecOptions } from 'shelljs'

shell.config.silent = true

export class Git {
  exec(command: string, execOptions: ExecOptions = {}) {
    return shell.exec(`git ${command}`, execOptions)
  }

  config(prop: string, value: string) {
    return this.exec(`config ${prop} ${value}`)
  }

  clone(url: string, name: string) {
    return this.exec(`clone ${url} ${name}`)
  }

  addRemote(url: string, name: string) {
    return this.exec(`remote add ${name} ${url}`)
  }

  branch(branch: string, option?: string) {
    return this.exec(`branch ${option} ${branch}`)
  }

  checkout(branch: string, option?: string) {
    return this.exec(`checkout ${option} ${branch}`)
  }

  fetch(repo: string, branch: string) {
    return this.exec(`fetch ${repo} ${branch}`)
  }

  merge(branch: string) {
    return this.exec(`merge ${branch}`)
  }

  cherryPick(hash: string) {
    return this.exec(`cherry-pick ${hash}`)
  }

  push(repo: string, branch: string) {
    return this.exec(`push ${repo} ${branch}`)
  }

  reset() {
    return this.exec('reset --hard')
  }
}
