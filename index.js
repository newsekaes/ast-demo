function tokenizer(input) {
    let current = 0;
    const tokens = []
    while (current < input.length) {
        let char = input[current]
        if (char === '(') {
            tokens.push({
                type: 'parenthesis',
                value: '('
            })
            current++
            continue;
        }
        if (char === ')') {
            tokens.push({
                type: 'parenthesis',
                value: ')'
            })
            current++
            continue
        }
        let whiteSpaceExp = /\s/
        if (whiteSpaceExp.test(char)) {
            current++
            continue
        }
        let numberExp = /[0-9]/
        if (numberExp.test(char)) {
            let value = ''
            while (numberExp.test(char)) {
                value += char
                char = input[++current]
            }
            tokens.push({
                type: 'number',
                value
            })
            continue
        }
        if (char === '"') {
            let value = ''
            char = input[++current]
            while (char !== '"') {
                value += char
                char = input[++current]
            }
            tokens.push({
                type: 'string',
                value
            })
            // skip the end '"'
            ++current
            continue
        }
        let letterExp = /[a-z]/i
        if (letterExp.test(char)) {
            let value = ''
            while (letterExp.test(char)) {
                value += char
                char = input[++current]
            }
            tokens.push({
                type: 'name',
                value
            })
            continue
        }
        throw new TypeError('unknown character: ' + char)
    }
    return tokens
}

function parser(tokens) {
    let current = 0
    function walk() {
        let token = tokens[current]
        if (token.type === 'number') {
            current++
            return {
                type: 'NumberLiteral',
                value: token.value
            }
        }
        if (token.type === 'string') {
            current++
            return {
                type: 'StringLiteral',
                value: token.value,
            }
        }
        if (token.type === 'parenthesis' && token.value === '(') {
            token = tokens[++current]
            let node = {
                type: 'CallExpression',
                name: token.value,
                params: []
            }
            token = tokens[++current]
            while (!(token.type === 'parenthesis' && token.value === ')')) {
                node.params.push(walk())
                token = tokens[current]
            }
            current++
            return node
        }
        throw new TypeError(token.type)
    }
    let ast = {
        type: 'Program',
        body: [],
    }
    while(current < tokens.length) {
        ast.body.push(walk())
    }
    return ast;
}
function traverser(ast, visitor) {
    function traverseArray(array, parent) {
        array.forEach(child => {
            traverseNode(child, parent)
        })
    }
    function traverseNode(node, parent) {
        let methods = visitor[node.type]
        if (methods && methods.enter) {
            methods.enter(node, parent)
        }
        switch (node.type) {
            case 'Program':
                traverseArray(node.body, node)
                break
            case 'CallExpression':
                traverseArray(node.params, node)
                break
            case 'NumberLiteral':
            case 'StringLiteral':
                break
            default:
                throw new TypeError(node.type)
        }
        if (methods && methods.exit) {
            methods.exit(node, parent)
        }
    }
    traverseNode(ast, null)
}
function transform(ast) {
    let newAst = {
        type: 'Program',
        body: []
    }
    traverser(ast, {
        'Program': {
            enter(node) {
                node._context = newAst.body
            },
            exit(node) {
                delete node._context
            }
        },
        'CallExpression': {
            enter(node, parent) {
                console.log('enter:' + node.name)
                let expression = {
                    type: 'CallExpression',
                    callee: {
                        type: 'Identifier',
                        name: node.name,
                    },
                    arguments: []
                }
                node._context = expression.arguments
                if (parent.type !== 'CallExpression') {
                    expression = {
                        type: 'ExpressionStatement',
                        expression
                    }
                }
                parent._context.push(expression)
            },
            exit(node, parent) {
                console.log('exit:' + node.name)
                delete node._context
            }
        },
        'NumberLiteral': {
            enter(node, parent) {
                console.log(`enter: ${node.type}-${node.value}`)
                parent._context.push({
                    type: 'NumberLiteral',
                    value: node.value
                })
            },
            exit(node, parent) {
                console.log(`exit: ${node.type}-${node.value}`)
                delete node._context
            }
        },
        'StringLiteral': {
            enter(node, parent) {
                console.log(`enter: ${node.type}-${node.value}`)
                parent._context.push({
                    type: 'StringLiteral',
                    value: node.value
                })
            },
            exit(node, parent) {
                console.log(`exit: ${node.type}-${node.value}`)
                delete node._context
            }
        }
    })
    return newAst
}

function codeGenerator(node) {
    switch (node.type) {
        case 'Program':
            return node.body.map(codeGenerator).join('\n');
        case 'ExpressionStatement':
            return codeGenerator(node.expression) + ';'
        case 'CallExpression':
            return `${codeGenerator(node.callee)}(${node.arguments.map(codeGenerator).join(', ')})`
        case 'Identifier':
            return node.name
        case 'NumberLiteral':
            return node.value
        case 'StringLiteral':
            return `"${node.value}"`
        default:
            throw new TypeError(node.type)
    }
}

function compile(input) {
    let tokens = tokenizer(input)
    let ast = parser(tokens)
    let newAst = transform(ast)
    return codeGenerator(newAst)
}
