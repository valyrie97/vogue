var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { createAst } from './createAst';
import path from 'path';
import debug from 'debug';
import { createRequire } from 'module';
var log = debug('vogue:module');
var Module = /** @class */ (function () {
    function Module() {
        this.links = {
            required: {
                single: [],
                arrays: []
            },
            optional: {
                single: [],
                arrays: []
            }
        };
        this.globals = [];
        this.functions = [];
        this.identifiers = {};
        this.name = {
            space: '',
            last: '',
            full: ''
        };
        this.imports = {};
        this.variables = {
            cold: [],
            warm: []
        };
        this.directives = {
            'singleton': false,
            'keepalive': false,
            'static': ''
        };
    }
    Module.prototype.directive = function (_a) {
        var directive = _a.directive, value = _a.value;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                this.directives[directive] = value;
                return [2 /*return*/];
            });
        });
    };
    Module.prototype.link = function (_a) {
        var required = _a.required, array = _a.array, name = _a.name;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                this.links[required ? 'required' : 'optional'][array ? 'arrays' : 'single']
                    .push(name);
                return [2 /*return*/];
            });
        });
    };
    Module.prototype.namespace = function (_a) {
        var namespace = _a.namespace;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                this.name.space = namespace;
                this.name.full = this.name.space + '.' + this.name.last;
                return [2 /*return*/];
            });
        });
    };
    Module.prototype["function"] = function (_a) {
        var name = _a.name, block = _a.block, parameters = _a.parameters;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                this.functions[name] = {
                    code: block,
                    parameters: parameters
                };
                return [2 /*return*/];
            });
        });
    };
    Module.prototype["import"] = function (_a) {
        var importName = _a.importName, name = _a.name;
        return __awaiter(this, void 0, void 0, function () {
            var nodePath, __require__, imported;
            return __generator(this, function (_b) {
                nodePath = path.resolve(this.rootDir, 'node_module');
                log('#'.repeat(80));
                log(nodePath);
                __require__ = createRequire(nodePath);
                imported = __require__(importName);
                if ('default' in imported)
                    this.imports[name] = imported["default"];
                else
                    this.imports[name] = imported;
                return [2 /*return*/];
            });
        });
    };
    Module.prototype.variable = function (_a) {
        var persist = _a.persist, name = _a.name;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                this.variables[persist ? 'cold' : 'warm'].push(name);
                return [2 /*return*/];
            });
        });
    };
    Module.create = function (location, rootDir) {
        return __awaiter(this, void 0, void 0, function () {
            var module, ast, name, _i, ast_1, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        module = new Module();
                        ast = createAst(location);
                        name = path.parse(location).name;
                        module.name.last = name;
                        module.name.full = name;
                        module.rootDir = rootDir;
                        _i = 0, ast_1 = ast;
                        _a.label = 1;
                    case 1:
                        if (!(_i < ast_1.length)) return [3 /*break*/, 4];
                        item = ast_1[_i];
                        if ('name' in item) {
                            if (item.name in module.identifiers)
                                throw new Error('Identifier ' + item.name + ' already declared!');
                            else
                                module.identifiers[item.name] = item.type;
                        }
                        if (!(item.type in module)) return [3 /*break*/, 3];
                        return [4 /*yield*/, module[item.type](item)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        log('='.repeat(80));
                        log(location);
                        log(module);
                        return [2 /*return*/, module];
                }
            });
        });
    };
    return Module;
}());
export default Module;
