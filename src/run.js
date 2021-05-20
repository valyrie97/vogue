#!/usr/bin/env node
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import debug from 'debug';
var log = debug('vogue:cli');
var systemLocation = resolve(process.argv[2]);
import { parse, resolve, dirname } from 'path';
import { readdirSync, lstatSync } from 'fs';
import _ from 'lodash';
import Module from './Module';
import System from './System';
import './extensions.js';
import { fileURLToPath } from 'url';
var get = _.get, set = _.set;
var standardLibrary = resolve(fileURLToPath(dirname(import.meta.url)), 'lib');
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var ignoreDeps, files, fullpaths, modules, sys;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ignoreDeps = function (path) { return parse(path).name !== 'node_modules'; };
                files = __spreadArray(__spreadArray([], walkdirSync(systemLocation, ignoreDeps)), walkdirSync(standardLibrary, ignoreDeps));
                fullpaths = files
                    .filter(function (v) { return lstatSync(v).isFile(); })
                    .filter(function (v) { return parse(v).ext === '.v'; });
                log('included modules');
                log(files);
                log('parsing modules...');
                return [4 /*yield*/, Promise.all(fullpaths.map(function (loc) { return Module.create(loc, systemLocation); }))];
            case 1:
                modules = _a.sent();
                sys = new System(modules, systemLocation);
                return [2 /*return*/];
        }
    });
}); })();
function walkdirSync(root, filter) {
    if (filter === void 0) { filter = function () { return true; }; }
    log('reading', root, '...');
    var paths = readdirSync(root).map(function (v) { return resolve(root, v); });
    var _a = sift(paths.filter(filter), function (v) { return lstatSync(v).isFile(); }), files = _a[0], dirs = _a[1];
    log("files: " + files.length + " | dirs: " + dirs.length);
    var rfiles = dirs.map(function (v) { return walkdirSync(v, filter); }).reduce(function (a, v) { return __spreadArray(__spreadArray([], a), v); }, []);
    return __spreadArray(__spreadArray([], files), rfiles);
}
function sift(a, fn) {
    var left = [], right = [];
    for (var i = 0; i < a.length; i++) {
        var v = a[i];
        var lr = !!fn(v, i, a);
        if (lr)
            left = __spreadArray(__spreadArray([], left), [v]);
        else
            right = __spreadArray(__spreadArray([], right), [v]);
    }
    return [left, right];
}
