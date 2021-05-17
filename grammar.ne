@lexer lexer

PROGRAM -> _ STATEMENT:+ _ {% ([,stuff,]) => { return stuff } %}

STATEMENT -> _ LINK_DECLARATION EOL {% ([,stuff]) => { return stuff } %}
           | _ FUNCTION_DECLARATION EOL {% ([,d]) => d %}
           | _ %NAMESPACE __ NAMESPACE EOL {% ([,,,namespace]) => { return { type: 'namespace', namespace: namespace[0] } } %}
           | _ DIRECTIVE_STATEMENT EOL {% ([,d]) => d %}
           | _ IMPORT_STATMENT EOL {% ([,d]) => d %}
           | _ %RUNTIME __ %MEMBER __ IDENTIFIER EOL {% ([,,,,,identifier]) => {return{ type: 'variable', persist: false, name: identifier }} %}
           | _ %MEMBER __ IDENTIFIER EOL {% ([,,,identifier]) => {return{ type: 'variable', persist: true, name: identifier }} %}

IMPORT_STATMENT -> %IMPORT __ STRING __ %AS __ IDENTIFIER {% ([,,moduleName,,,,identifier]) => { return { type: 'import', name: identifier, importName: moduleName }} %}
                 | %IMPORT __ IDENTIFIER __ %FROM __ STRING {% ([,,identifier,,,,moduleName]) => { return { type: 'import', name: identifier, importName: moduleName }} %}

FUNCTION_DECLARATION -> _ IDENTIFIER _ PARAMETERS:? _ JS_BLOCK EOL {% ([,name,,params,,block]) => { return { type: 'function', name: name, block, parameters: params } } %}
                      | _ %ASYNC __ IDENTIFIER _ PARAMETERS:? _ JS_BLOCK_ASYNC EOL {% ([,,,name,,params,,block]) => { return { type: 'function', name: name, block, parameters: params } } %}

DIRECTIVE_STATEMENT -> DIRECTIVE __ IDENTIFIER EOL {% ([directive,,identifier]) => { return { type: 'directive', directive, value: identifier }} %}
                     | DIRECTIVE EOL {% ([directive]) => { return { type: 'directive', directive }} %}

DIRECTIVE -> %SINGLETON {% () => 'singleton' %}
           | %KEEPALIVE {% () => 'keepalive' %}
           | %STATIC    {% () => 'static' %}

LINK_DECLARATION -> LINK __ IDENTIFIER {% ([,,id]) => { return { type: 'link', array: false, required: false, name: id }} %}
                  | LINK_ARR __ IDENTIFIER {% ([,,id]) => { return { type: 'link', array: true, required: false, name: id }} %}
                  | %REQUIRED __ LINK __ IDENTIFIER {% ([,,,,id]) => { return { type: 'link', array: false, required: true, name: id }} %}
                  | %REQUIRED __ LINK_ARR __ IDENTIFIER {% ([,,,,id]) => { return { type: 'link', array: true, required: true, name: id }} %}

LINK -> %LINK
LINK_ARR -> %LINK %LSQBRACKET %RSQBRACKET

NAMESPACE -> IDENTIFIER
           | IDENTIFIER %DOTOP NAMESPACE {% ([a,,b]) => { return [`${a}.${b}`] } %}

OPEN_PARAMETERS -> _ IDENTIFIER _ ADDITIONAL_PARAMETERS:? _ {% ([,identifier,,more,]) => more ? [identifier, ...more] : [identifier] %}
PARAMETERS -> _ %LPAREN _ IDENTIFIER _ ADDITIONAL_PARAMETERS:? _ %RPAREN _ {% ([,,,identifier,,more,,,]) => more ? [identifier, ...more] : [identifier] %}
ADDITIONAL_PARAMETERS -> %COMMA _ IDENTIFIER _ ADDITIONAL_PARAMETERS:? {% ([,,identifier,,more]) => more ? [identifier, ...more] : [identifier] %}

EOL -> _ %SEMICOLON:?
STRING -> %STRING {% ([d]) => d.value.substring(1, d.value.length - 1) %}
SEMICOLON -> %SEMICOLON
IDENTIFIER -> %IDENTIFIER {% ([id]) => id.value %}
JS_BLOCK -> %JS_BLOCK {% ([block]) => minify(`result = (() => {${block.value.substring(2, block.value.length - 2)}})();`) %}
          | %JS_BLOCK2 {% ([block]) => minify(`result = (() => {${block.value.substring(1, block.value.length - 1)}})();`) %}
JS_BLOCK_ASYNC -> %JS_BLOCK {% ([block]) => minify(`result = (async () => {${block.value.substring(2, block.value.length - 2)}})();`) %}
                | %JS_BLOCK2 {% ([block]) => minify(`result = (async () => {${block.value.substring(1, block.value.length - 1)}})();`) %}
SPREAD_OPERATOR -> %SPREAD_OPERATOR
_ -> null | %SPACE {% () => undefined %}
__ -> %SPACE {% () => undefined %}