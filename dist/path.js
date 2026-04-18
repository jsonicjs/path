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
    jsonic.grammar({
        ref: {
            '@val-bo': (r, ctx) => {
                // At top level, create path array, or inherit from meta context.
                if (0 === r.d) {
                    r.k.path = ctx.meta.path?.base?.slice(0) || [];
                }
            },
            '@map-bo': (r) => {
                // Not in an array, so no need to track element index.
                delete r.k.index;
            },
            '@pair-ao': (r) => {
                if (0 < r.d && r.u.pair) {
                    r.child.k.path = [...r.k.path, r.u.key];
                    r.child.k.key = r.u.key;
                }
            },
            '@list-bo': (r) => {
                // In array, the path property is the element index.
                r.k.index = -1;
            },
            '@elem-ao': (r) => {
                if (0 < r.d) {
                    r.k.index = 1 + r.k.index;
                    r.child.k.path = [...r.k.path, r.k.index];
                    r.child.k.key = r.k.index;
                    r.child.k.index = r.k.index;
                }
            },
        },
        rule: {
            val: {
                open: { alts: [{ c: () => false, g: 'path' }], inject: { append: true } },
            },
            map: {
                open: { alts: [{ c: () => false, g: 'path' }], inject: { append: true } },
            },
            pair: {
                open: { alts: [{ c: () => false, g: 'path' }], inject: { append: true } },
            },
            list: {
                open: { alts: [{ c: () => false, g: 'path' }], inject: { append: true } },
            },
            elem: {
                open: { alts: [{ c: () => false, g: 'path' }], inject: { append: true } },
            },
        },
    });
};
exports.Path = Path;
Path.defaults = {};
//# sourceMappingURL=path.js.map