module.exports = function test() {
    const astTool = require('./index')
    debugger
    const inputTemp = `(combine "abc" (add 23 (sub 3 (add 122 43))))`
    const outputTemp = astTool.compile(inputTemp)
    console.log(outputTemp)
}
