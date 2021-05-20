import uglify from 'uglify-js';
export default (function (code) {
    return uglify.minify(code, {
        compress: {
            dead_code: true,
            global_defs: {
                DEBUG: false
            }
        },
        sourceMap: {
            content: 'inline'
        }
    }).code;
});
