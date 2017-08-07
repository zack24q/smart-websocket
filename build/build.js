const version = require('../package.json').version
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const progress = require('rollup-plugin-progress')
const filesize = require('rollup-plugin-filesize')

const banner = `/**
* smart-websocket v${version}
* https://github.com/zack24q/smart-websocket
* Released under the MIT License.
*/
`

const config = {}
config.entry = {
  entry: 'src/index.js',
  plugins: [
    babel(), progress(), filesize()]
}
config.bundles = [{
  banner: banner,
  format: 'es',
  dest: 'dist/smart-websocket.esm.js'
}, {
  banner: banner,
  format: 'umd',
  moduleName: 'SmartWebsocket',
  dest: 'dist/smart-websocket.umd.js'
}]

rollup.rollup(config.entry).then(bundle => {
  config.bundles.map(value => {
    bundle.write(value)
  })
})
