@lexer lexer

PROGRAM -> _ STATEMENT:+ _ {% ([,stuff,]) => { return stuff } %}

STATEMENT -> _ LINK_DECLARATION _ SEMICOLON {% ([,stuff]) => { return stuff } %}
          | _ %RESTORE _ JS_BLOCK _ SEMICOLON {% ([,,,block]) => { return { type: 'restore', block: block } } %}
          | _ IDENTIFIER _ JS_BLOCK _ SEMICOLON {% ([,name,,block]) => { return { type: 'function', name: name, block: block } } %}
          | _ %NAMESPACE __ NAMESPACE _ SEMICOLON {% ([,,,namespace]) => { return { type: 'namespace', namespace: namespace[0] } } %}
          | _ DIRECTIVE _ SEMICOLON {% ([,directive]) => { return { type: 'directive', value: directive }} %}
          | _ %IMPORT __ STRING __ %AS __ IDENTIFIER _ SEMICOLON {% ([,,,moduleName,,,,identifier]) => { return { type: 'import', name: identifier, importName: moduleName }} %}

DIRECTIVE -> _ %SINGLETON {% () => 'singleton' %}
           | _ %KEEPALIVE {% () => 'keepalive' %}

LINK_DECLARATION -> _ %LINK __ IDENTIFIER {% ([,,,id]) => { return { type: 'link', array: false, required: false, name: id }} %}
                  | _ %LINK _ %ARRAY __ IDENTIFIER {% ([,,,,,id]) => { return { type: 'link', array: true, required: false, name: id }} %}
                  | _ %REQUIRED __ %LINK __ IDENTIFIER {% ([,,,,,id]) => { return { type: 'link', array: false, required: true, name: id }} %}
                  | _ %REQUIRED __ %LINK _ %ARRAY __ IDENTIFIER {% ([,,,,,,,id]) => { return { type: 'link', array: true, required: true, name: id }} %}

NAMESPACE -> IDENTIFIER
           | IDENTIFIER %DOTOP NAMESPACE {% ([a,,b]) => { return [`${a}.${b}`] } %}

EOL -> SEMICOLON
     | "\n"
STRING -> %STRING {% ([d]) => d.value.substring(1, d.value.length - 1) %}
SEMICOLON -> %SEMICOLON:?
IDENTIFIER -> %IDENTIFIER {% ([id]) => id.value %}
JS_BLOCK -> %JS_BLOCK {% ([block]) => minify(block.value.substring(2, block.value.length - 2)) %}
          | %JS_BLOCK2 {% ([block]) => minify(block.value.substring(2, block.value.length - 2)) %}
_ -> null | %SPACE {% () => undefined %}
__ -> %SPACE {% () => undefined %}