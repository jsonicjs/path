"use strict";
/* Copyright (c) 2022-2025 Richard Rodger and other contributors, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const code_1 = require("@hapi/code");
const jsonic_1 = require("jsonic");
const expr_1 = require("@jsonic/expr");
const path_1 = require("../dist/path");
(0, node_test_1.describe)('path', () => {
    (0, node_test_1.test)('happy', () => {
        const j = jsonic_1.Jsonic.make().use(path_1.Path);
        (0, code_1.expect)(j('{a:{b:1,c:[2,3]}}')).to.equal({ a: { b: 1, c: [2, 3] } });
    });
    (0, node_test_1.test)('basic', () => {
        const j = jsonic_1.Jsonic.make().use(path_1.Path).use((jsonic) => {
            jsonic.rule('val', rs => {
                rs
                    .ac(false, (r) => {
                    if ('object' !== typeof (r.node)) {
                        r.node = `<${r.node}:${r.k.path}>`;
                    }
                    else {
                        r.node.$ = `<${r.k.path}>`;
                    }
                });
            });
        });
        let c = [
            '<2:a,c,0>',
            '<3:a,c,1>',
        ];
        c.$ = '<a,c>';
        (0, code_1.expect)(j('{a:{b:1,c:[2,3]}}')).to.equal({
            $: '<>',
            a: {
                $: '<a>',
                b: '<1:a,b>',
                c
            }
        });
    });
    (0, node_test_1.test)('meta', () => {
        const j = jsonic_1.Jsonic.make().use(path_1.Path).use((jsonic) => {
            jsonic.rule('val', rs => {
                rs
                    .ac(false, (r) => {
                    if ('object' === typeof (r.node)) {
                        r.node.$ = `<${r.k.path}>`;
                    }
                });
            });
        });
        (0, code_1.expect)(j('a:b:c:1,d:e:2', { path: { base: ['x', 'y'] } })).to.equal({
            $: '<x,y>',
            a: {
                $: '<x,y,a>',
                b: {
                    $: '<x,y,a,b>',
                    c: 1
                }
            },
            d: {
                $: '<x,y,d>',
                e: 2
            }
        });
    });
    (0, node_test_1.test)('object', () => {
        const j = jsonic_1.Jsonic.make().use(path_1.Path).use((jsonic) => {
            jsonic.rule('val', rs => {
                rs
                    .ac(false, (r) => {
                    if ('object' !== typeof (r.node)) {
                        r.node = `<${r.node}:${r.k.path}>`;
                    }
                    else {
                        r.node.$ = `<${r.k.path}>`;
                    }
                });
            });
        });
        (0, code_1.expect)(j('a:1')).to.equal({ $: '<>', a: '<1:a>' });
        (0, code_1.expect)(j('a:1,b:B')).to.equal({ $: '<>', a: '<1:a>', b: '<B:b>' });
        (0, code_1.expect)(j('a:1,b:B,c:true'))
            .to.equal({ $: '<>', a: '<1:a>', b: '<B:b>', c: '<true:c>' });
        (0, code_1.expect)(j('{a:1}')).to.equal({ $: '<>', a: '<1:a>' });
        (0, code_1.expect)(j('{a:1,b:B}')).to.equal({ $: '<>', a: '<1:a>', b: '<B:b>' });
        (0, code_1.expect)(j('{a:1,b:B,c:true}'))
            .to.equal({ $: '<>', a: '<1:a>', b: '<B:b>', c: '<true:c>' });
        (0, code_1.expect)(j('x:{a:1}')).to.equal({ $: '<>', x: { $: '<x>', a: '<1:x,a>' } });
        (0, code_1.expect)(j('x:{a:1,b:B}'))
            .to.equal({ $: '<>', x: { $: '<x>', a: '<1:x,a>', b: '<B:x,b>' } });
        (0, code_1.expect)(j('x:{a:1,b:B,c:true}'))
            .to.equal({
            $: '<>',
            x: { $: '<x>', a: '<1:x,a>', b: '<B:x,b>', c: '<true:x,c>' }
        });
        (0, code_1.expect)(j('y:x:{a:1}'))
            .to.equal({ $: '<>', y: { $: '<y>', x: { $: '<y,x>', a: '<1:y,x,a>' } } });
        (0, code_1.expect)(j('y:x:{a:1,b:B}'))
            .to.equal({
            $: '<>',
            y: { $: '<y>', x: { $: '<y,x>', a: '<1:y,x,a>', b: '<B:y,x,b>' } }
        });
        (0, code_1.expect)(j('y:x:{a:1,b:B,c:true}'))
            .to.equal({
            $: '<>', y: {
                $: '<y>',
                x: { $: '<y,x>', a: '<1:y,x,a>', b: '<B:y,x,b>', c: '<true:y,x,c>' }
            }
        });
        (0, code_1.expect)(j('z:y:x:{a:1}'))
            .to.equal({
            $: '<>',
            z: { $: '<z>', y: { $: '<z,y>', x: { $: '<z,y,x>', a: '<1:z,y,x,a>' } } }
        });
        (0, code_1.expect)(j('z:y:x:{a:1,b:B}'))
            .to.equal({
            $: '<>',
            z: {
                $: '<z>',
                y: { $: '<z,y>', x: { $: '<z,y,x>', a: '<1:z,y,x,a>', b: '<B:z,y,x,b>' } }
            }
        });
        (0, code_1.expect)(j('z:y:x:{a:1,b:B,c:true}'))
            .to.equal({
            $: '<>',
            z: {
                $: '<z>',
                y: {
                    $: '<z,y>',
                    x: {
                        $: '<z,y,x>',
                        a: '<1:z,y,x,a>', b: '<B:z,y,x,b>', c: '<true:z,y,x,c>'
                    }
                }
            }
        });
    });
    (0, node_test_1.test)('array', () => {
        const j = jsonic_1.Jsonic.make().use(path_1.Path).use((jsonic) => {
            jsonic.rule('val', rs => {
                rs
                    .ac(false, (r) => {
                    if ('object' !== typeof (r.node)) {
                        r.node = `<${r.node}:${r.k.path}>`;
                    }
                    else {
                        r.node = { ...r.node };
                        r.node.$ = `<${r.k.path}>`;
                    }
                });
            });
        });
        (0, code_1.expect)(j('[]')).to.equal({ $: '<>' });
        (0, code_1.expect)(j('[1]')).to.equal({ $: '<>', 0: '<1:0>' });
        (0, code_1.expect)(j('[1,2]')).to.equal({ $: '<>', 0: '<1:0>', 1: '<2:1>' });
        (0, code_1.expect)(j('[1,2,3]')).to.equal({ $: '<>', 0: '<1:0>', 1: '<2:1>', 2: '<3:2>' });
        (0, code_1.expect)(j('[[]]')).to.equal({ $: '<>', 0: { $: '<0>' } });
        (0, code_1.expect)(j('[[1]]')).to.equal({ $: '<>', 0: { $: '<0>', 0: '<1:0,0>' } });
        (0, code_1.expect)(j('[[1,2]]'))
            .to.equal({ $: '<>', 0: { $: '<0>', 0: '<1:0,0>', 1: '<2:0,1>' } });
        (0, code_1.expect)(j('[[1,2,3]]'))
            .to.equal({ $: '<>', 0: { $: '<0>', 0: '<1:0,0>', 1: '<2:0,1>', 2: '<3:0,2>' } });
        (0, code_1.expect)(j('[[[]]]')).to.equal({ $: '<>', 0: { $: '<0>', 0: { $: '<0,0>' } } });
        (0, code_1.expect)(j('[[[1]]]'))
            .to.equal({ $: '<>', 0: { $: '<0>', 0: { $: '<0,0>', 0: '<1:0,0,0>' } } });
        (0, code_1.expect)(j('[[[1,2]]]'))
            .to.equal({
            $: '<>',
            0: { $: '<0>', 0: { $: '<0,0>', 0: '<1:0,0,0>', 1: '<2:0,0,1>' } }
        });
        (0, code_1.expect)(j('[[[1,2,3]]]'))
            .to.equal({
            $: '<>',
            0: {
                $: '<0>',
                0: { $: '<0,0>', 0: '<1:0,0,0>', 1: '<2:0,0,1>', 2: '<3:0,0,2>' }
            }
        });
    });
    (0, node_test_1.test)('transform', () => {
        const j = jsonic_1.Jsonic.make().use(path_1.Path).use((jsonic) => {
            jsonic.rule('val', rs => {
                rs
                    .ac(false, (r) => {
                    if ('object' !== typeof (r.node)) {
                        r.node = {
                            o: 'val',
                            v: r.node,
                            p: r.k.path,
                            k: r.k.key,
                        };
                    }
                    else {
                        r.node = {
                            o: Array.isArray(r.node) ? 'arr' : 'obj',
                            v: { ...r.node },
                            p: r.k.path,
                            k: r.k.key,
                        };
                    }
                });
            });
        });
        (0, code_1.expect)(j('{a:{b:1}}')).to.equal({
            k: undefined,
            o: 'obj',
            p: [],
            v: {
                a: {
                    k: 'a',
                    o: 'obj',
                    p: ['a',],
                    v: {
                        b: {
                            k: 'b',
                            o: 'val',
                            p: ['a', 'b',],
                            v: 1,
                        },
                    },
                },
            },
        });
        (0, code_1.expect)(j('{a:{b:1,c:{d:{e:2}}},f:4}')).to.equal({
            k: undefined,
            o: 'obj',
            p: [],
            v: {
                a: {
                    k: 'a',
                    o: 'obj',
                    p: ['a',],
                    v: {
                        b: {
                            k: 'b',
                            o: 'val',
                            p: ['a', 'b',],
                            v: 1,
                        },
                        c: {
                            k: 'c',
                            o: 'obj',
                            p: ['a', 'c'],
                            v: {
                                d: {
                                    k: 'd',
                                    o: 'obj',
                                    p: ['a', 'c', 'd'],
                                    v: {
                                        e: {
                                            k: 'e',
                                            o: 'val',
                                            p: ['a', 'c', 'd', 'e'],
                                            v: 2
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
                f: {
                    k: 'f',
                    o: 'val',
                    p: ['f',],
                    v: 4,
                },
            },
        });
        (0, code_1.expect)(j('[a,b,c]')).to.equal({
            k: undefined,
            o: 'arr',
            p: [],
            v: {
                0: {
                    k: 0,
                    o: 'val',
                    p: [0],
                    v: 'a',
                },
                1: {
                    k: 1,
                    o: 'val',
                    p: [1],
                    v: 'b',
                },
                2: {
                    k: 2,
                    o: 'val',
                    p: [2],
                    v: 'c',
                },
            }
        });
        (0, code_1.expect)(j('[a,[b],{c:1,d:[2,3]}]')).to.equal({
            k: undefined,
            o: 'arr',
            p: [],
            v: {
                0: {
                    k: 0,
                    o: 'val',
                    p: [0],
                    v: 'a',
                },
                1: {
                    k: 1,
                    o: 'arr',
                    p: [1],
                    v: {
                        0: {
                            k: 0,
                            o: 'val',
                            p: [1, 0],
                            v: 'b',
                        }
                    }
                },
                2: {
                    k: 2,
                    o: 'obj',
                    p: [2],
                    v: {
                        c: {
                            k: 'c',
                            o: 'val',
                            p: [2, 'c'],
                            v: 1,
                        },
                        d: {
                            k: 'd',
                            o: 'arr',
                            p: [2, 'd'],
                            v: {
                                0: {
                                    k: 0,
                                    o: 'val',
                                    p: [2, 'd', 0],
                                    v: 2,
                                },
                                1: {
                                    k: 1,
                                    o: 'val',
                                    p: [2, 'd', 1],
                                    v: 3,
                                },
                            }
                        },
                    }
                },
            }
        });
    });
    (0, node_test_1.test)('value', () => {
        const j = jsonic_1.Jsonic.make()
            .use(path_1.Path)
            .use((jsonic) => {
            jsonic.options({
                value: {
                    def: {
                        AAA: {
                            val: (r) => {
                                return { AAA: 1, k: r.k.key, p: r.k.path };
                            }
                        }
                    }
                }
            });
        });
        (0, code_1.expect)(j('a:AAA')).to.equal({ a: { AAA: 1, k: 'a', p: ['a'] } });
    });
    (0, node_test_1.test)('expr', () => {
        const j = jsonic_1.Jsonic.make()
            .use(path_1.Path)
            .use(expr_1.Expr, {
            op: {
                'foo': {
                    infix: true, src: '%', left: 14000, right: 15000
                },
            },
            evaluate: (r, _c, _op, terms) => {
                return { foo: terms[0] * terms[1], k: r.k.key, p: r.k.path };
            }
        });
        (0, code_1.expect)(j('{a:2%3}')).to.equal({ a: { foo: 6, k: 'a', p: ['a'] } });
        (0, code_1.expect)(j('a:2%3')).to.equal({ a: { foo: 6, k: 'a', p: ['a'] } });
    });
});
//# sourceMappingURL=path.test.js.map