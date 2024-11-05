"use strict";
/* Copyright (c) 2022-2024 Richard Rodger, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = void 0;
/* Keeps track of the property path to the current location.
 * Example: {a:{b:1 ## path=["a","b"]
 * Use the Rule.k key-value store so that the path is propagated to children and followers.
 * Depth must be greater than 0 - ensures path only starts once top level implicit is set up.
 */
const Path = (jsonic, _options) => {
    jsonic.rule('val', (rs) => {
        rs.bo((r, ctx) => {
            var _a, _b;
            // At top level, create path array, or inherit from meta context.
            if (0 === r.d) {
                r.k.path = ((_b = (_a = ctx.meta.path) === null || _a === void 0 ? void 0 : _a.base) === null || _b === void 0 ? void 0 : _b.slice(0)) || [];
            }
        });
    });
    jsonic.rule('map', (rs) => {
        rs.bo((r) => {
            // Not in an array, so no need to track element index.
            delete r.k.index;
        });
    });
    jsonic.rule('pair', (rs) => {
        rs.ao((r) => {
            if (0 < r.d && r.u.pair) {
                r.child.k.path = [...r.k.path, r.u.key];
                r.child.k.key = r.u.key;
            }
        });
    });
    jsonic.rule('list', (rs) => {
        rs.bo((r) => {
            // In array, the path property is the element index.
            r.k.index = -1;
        });
    });
    jsonic.rule('elem', (rs) => {
        rs.ao((r) => {
            if (0 < r.d) {
                r.k.index = 1 + r.k.index;
                r.child.k.path = [...r.k.path, r.k.index];
                r.child.k.key = r.k.index;
                r.child.k.index = r.k.index;
            }
        });
    });
};
exports.Path = Path;
Path.defaults = {};
//# sourceMappingURL=path.js.map