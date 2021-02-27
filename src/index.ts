import { assert } from './utils'
import { createConfig } from './config'
import { CheTsumi } from './chetsumi'

assert(!!process.env.USER_NAME, '`userName` is required.')
assert(!!process.env.EMAIL, '`email` is required.')
assert(!!process.env.ACCESS_TOKEN, '`accessToken` is required.')
assert(!!process.env.UPSTREAM_REPO, '`upstreamRepo` is required.')
assert(!!process.env.HEAD_REPO, '`headRepo` is required.')
assert(!!process.env.TRACK_FROM, '`trackFrom` is required.')

const config = createConfig({
  userName: process.env.USER_NAME!,
  email: process.env.EMAIL!,
  accessToken: process.env.ACCESS_TOKEN!,
  upstreamRepo: process.env.UPSTREAM_REPO!,
  upstreamRepoBranch: process.env.UPSTREAM_REPO_BRANCH,
  headRepo: process.env.HEAD_REPO!,
  headRepoBranch: process.env.HEAD_REPO_BRANCH,
  workflowName: process.env.WORKFLOW_NAME,
  trackFrom: process.env.TRACK_FROM!,
  pathStartsWith: process.env.PATH_STARTS_WITH
})

const chetsumi = new CheTsumi(config)

process.on('unhandledRejection', err => { console.error(err) })

chetsumi.start()
