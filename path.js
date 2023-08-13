"use strict";
/* Copyright (c) 2022 Richard Rodger, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = void 0;
const Path = (jsonic, _options) => {
    jsonic.rule('val', (rs) => {
        rs.bo((r) => {
            if (0 === r.d) {
                r.k.path = [];
            }
        });
    });
    // TODO: fix type chaining with jsonic.rule
    jsonic.rule('map', (rs) => {
        rs
            // .bo(r => { r.k.index = -1 })
            .bo((r) => {
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