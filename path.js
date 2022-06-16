"use strict";
/* Copyright (c) 2022 Richard Rodger, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = void 0;
const Path = (jsonic, _options) => {
    jsonic
        .rule('val', rs => {
        rs
            .bo(false, r => {
            if (0 === r.d) {
                r.keep.path = [];
            }
        });
    });
    // TODO: fix type chaining with jsonic.rule
    jsonic
        .rule('map', rs => {
        rs
            .bo(r => { r.keep.index = -1; });
    });
    jsonic
        .rule('pair', rs => {
        rs
            .ao(false, r => {
            if (0 < r.d && r.use.pair) {
                r.child.keep.path = [...r.keep.path, r.use.key];
            }
        });
    });
    jsonic
        .rule('list', rs => {
        rs
            .bo(r => { r.keep.index = -1; });
    });
    jsonic
        .rule('elem', rs => {
        rs
            .ao(false, r => {
            if (0 < r.d) {
                r.keep.index = 1 + r.keep.index;
                r.child.keep.path = [...r.keep.path, r.keep.index];
            }
        });
    });
};
exports.Path = Path;
Path.defaults = {};
//# sourceMappingURL=path.js.map