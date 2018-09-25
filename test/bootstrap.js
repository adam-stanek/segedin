require('tsconfig-paths/register')
const { register: tsRegister } = require('ts-node')

tsRegister({
  // It is set by the TS_NODE_COMPILER env variable
  // compiler: "ttypescript"
})
