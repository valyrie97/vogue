var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Instance from './Instance';
import Serializable from './Serializable';
import _ from 'lodash';
import Module from './Module';
import debug from 'debug';
var log = debug('vogue:system');
var get = _.get, set = _.set;
var System = /** @class */ (function (_super) {
    __extends(System, _super);
    function System(modules, rootDir) {
        var _this = _super.call(this) || this;
        _this.instances = [];
        _this.namespace = {};
        _this.staticInstances = {};
        _this.modules = modules;
        _this.createNamespace();
        var bootModules = _this.deriveBootModules();
        _this.createStaticInstances();
        _this.rootDir = rootDir;
        log('instantiating boot modules...');
        for (var _i = 0, bootModules_1 = bootModules; _i < bootModules_1.length; _i++) {
            var name_1 = bootModules_1[_i];
            log('    ' + name_1);
            _this.newInstance(name_1);
        }
        return _this;
    }
    System.prototype.createStaticInstances = function () {
        log('deriving static modules...');
        var staticModules = this.modules.filter(function (module) {
            return !!module.static;
        }).map(function (module) {
            log('    ' + module.name.full);
            return module;
        });
        log('instantiating static modules...');
        for (var _i = 0, staticModules_1 = staticModules; _i < staticModules_1.length; _i++) {
            var module_1 = staticModules_1[_i];
            log('    ' + module_1.static + ': ' + module_1.name.full);
            this.staticInstances[module_1.static] =
                this.newInstance(module_1.name.full, {});
        }
    };
    System.prototype.deriveBootModules = function () {
        log('deriving boot modules...');
        var bootModules = this.modules.filter(function (module) {
            return module.singleton;
        }).map(function (module) {
            return module.name.full;
        });
        for (var _i = 0, bootModules_2 = bootModules; _i < bootModules_2.length; _i++) {
            var name_2 = bootModules_2[_i];
            log('    ' + name_2);
        }
        return bootModules;
    };
    System.prototype.createNamespace = function () {
        log('creating namespace map...');
        this.namespace = this.modules.reduce(function (acc, val) {
            if (get(acc, val.name.full) instanceof Module)
                throw new Error('Duplicate module "' + val.name.full + '"');
            set(acc, val.name.full, val);
            log('    ' + val.name.full);
            return acc;
        }, {});
    };
    System.prototype.getModule = function (name) {
        return get(this.namespace, name);
    };
    System.prototype.createInstance = function (name, args) {
        if (args === void 0) { args = {}; }
        return new Instance(this.getModule(name), null, args, this);
    };
    System.prototype.newInstance = function (name, args) {
        if (args === void 0) { args = {}; }
        var instance = this.createInstance(name, args);
        var link = instance.link;
        if (instance.hasPublicFunction('restore'))
            instance.invokeInternal('restore');
        return link;
    };
    return System;
}(Serializable));
export default System;
