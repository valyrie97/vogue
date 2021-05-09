@lexer lexer

PROGRAM -> _ STATEMENT:+ _ {% ([,stuff,]) => { return stuff } %}

STATEMENT -> _ LINK_DECLARATION EOL {% ([,stuff]) => { return stuff } %}
           | _ IDENTIFIER _ JS_BLOCK EOL {% ([,name,,block]) => { return { type: 'function', name: name, block } } %}
           | _ %NAMESPACE __ NAMESPACE EOL {% ([,,,namespace]) => { return { type: 'namespace', namespace: namespace[0] } } %}
           | _ DIRECTIVE EOL {% ([,directive]) => { return { type: 'directive', value: directive }} %}
           | _ %IMPORT __ STRING __ %AS __ IDENTIFIER EOL {% ([,,,moduleName,,,,identifier]) => { return { type: 'import', name: identifier, importName: moduleName }} %}
           | _ %RUNTIME __ %MEMBER __ IDENTIFIER EOL {% ([,,,,,identifier]) => {return{ type: 'variable', persist: false, name: identifier }} %}
           | _ %MEMBER __ IDENTIFIER EOL {% ([,,,identifier]) => {return{ type: 'variable', persist: true, name: identifier }} %}

DIRECTIVE -> _ %SINGLETON {% () => 'singleton' %}
           | _ %KEEPALIVE {% () => 'keepalive' %}

LINK_DECLARATION -> _ %LINK __ IDENTIFIER {% ([,,,id]) => { return { type: 'link', array: false, required: false, name: id }} %}
                  | _ %LINK _ %ARRAY __ IDENTIFIER {% ([,,,,,id]) => { return { type: 'link', array: true, required: false, name: id }} %}
                  | _ %REQUIRED __ %LINK __ IDENTIFIER {% ([,,,,,id]) => { return { type: 'link', array: false, required: true, name: id }} %}
                  | _ %REQUIRED __ %LINK _ %ARRAY __ IDENTIFIER {% ([,,,,,,,id]) => { return { type: 'link', array: true, required: true, name: id }} %}

NAMESPACE -> IDENTIFIER
           | IDENTIFIER %DOTOP NAMESPACE {% ([a,,b]) => { return [`${a}.${b}`] } %}

EOL -> _ %SEMICOLON:?
STRING -> %STRING {% ([d]) => d.value.substring(1, d.value.length - 1) %}
SEMICOLON -> %SEMICOLON
IDENTIFIER -> %IDENTIFIER {% ([id]) => id.value %}
JS_BLOCK -> %JS_BLOCK {% ([block]) => (`result = (() => {${block.value.substring(2, block.value.length - 2)}})();`) %}
          | %JS_BLOCK2 {% ([block]) => (`result = (() => {${block.value.substring(1, block.value.length - 1)}})();`) %}
_ -> null | %SPACE {% () => undefined %}
__ -> %SPACE {% () => undefined %}