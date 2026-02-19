const suites = [
  {
    name: 'router smoke',
    path: './router.smoke.test.js',
    kind: 'smoke',
  },
  {
    name: 'user store runtime',
    path: './user.store.test.js',
    kind: 'runtime',
  },
  {
    name: 'error handler runtime',
    path: './error-handler.test.js',
    kind: 'runtime',
  },
  {
    name: 'transaction logic runtime',
    path: './transaction.logic.test.js',
    kind: 'runtime',
  },
  {
    name: 'capabilities checklist',
    path: './capabilities.checklist.test.js',
    kind: 'runtime',
  },
]

const smokeOnly = process.argv.includes('--smoke')
const selectedSuites = smokeOnly ? suites.filter((suite) => suite.kind === 'smoke') : suites

let passed = 0
let failed = 0

for (const suite of selectedSuites) {
  try {
    const module = await import(suite.path)
    await module.run()
    passed += 1
    console.log(`PASS ${suite.name}`)
  }
  catch (error) {
    failed += 1
    console.error(`FAIL ${suite.name}`)
    console.error(error?.stack || error?.message || error)
  }
}

console.log(`\nResult: ${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}
