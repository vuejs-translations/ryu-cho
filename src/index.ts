import { createConfig } from './config'
import { RyuCho } from './ryu-cho'
import core from '@actions/core'

const config = createConfig({
  accessToken: core.getInput('access-token', { required: true }),
  userName: core.getInput('username', { required: true }),
  email: core.getInput('email', { required: true }),
  upstreamRepo: core.getInput('upstream-repo', { required: true }),
  upstreamRepoBranch: core.getInput('upstream-repo-branch', { required: true }),
  headRepo: core.getInput('head-repo', { required: true }),
  headRepoBranch: core.getInput('head-repo-branch'),
  workflowName: core.getInput('workflow-name'),
  trackFrom: core.getInput('track-from', { required: true }),
  pathStartsWith: core.getInput('path-starts-with'),
})

const ryuCho = new RyuCho(config)

process.on('unhandledRejection', (err) => {
  console.error(err)
})

ryuCho.start()
