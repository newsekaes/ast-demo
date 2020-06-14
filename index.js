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