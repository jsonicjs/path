"use strict";
/* Copyright (c) 2022 Richard Rodger and other contributors, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
const jsonic_next_1 = require("@jsonic/jsonic-next");
const expr_1 = require("@jsonic/expr");
const path_1 = require("../path");
describe('path', () => {
    test('happy', () => {
        const j = jsonic_next_1.Jsonic.make().use(path_1.Path);
        expect(j('{a:{b:1,c:[2,3]}}')).toEqual({ a: { b: 1, c: [2, 3] } });
    });
    test('basic', () => {
        const j = jsonic_next_1.Jsonic.make().use(path_1.Path).use((jsonic) => {
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
        expect(j('{a:{b:1,c:[2,3]}}')).toEqual({
            $: '<>',
            a: {
                $: '<a>',
                b: '<1:a,b>',
                c
            }
        });
    });
    test('object', () => {
        const j = jsonic_next_1.Jsonic.make().use(path_1.Path).use((jsonic) => {
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
        expect(j('a:1')).toEqual({ $: '<>', a: '<1:a>' });
        expect(j('a:1,b:B')).toEqual({ $: '<>', a: '<1:a>', b: '<B:b>' });
        expect(j('a:1,b:B,c:true'))
            .toEqual({ $: '<>', a: '<1:a>', b: '<B:b>', c: '<true:c>' });
        expect(j('{a:1}')).toEqual({ $: '<>', a: '<1:a>' });
        expect(j('{a:1,b:B}')).toEqual({ $: '<>', a: '<1:a>', b: '<B:b>' });
        expect(j('{a:1,b:B,c:true}'))
            .toEqual({ $: '<>', a: '<1:a>', b: '<B:b>', c: '<true:c>' });
        expect(j('x:{a:1}')).toEqual({ $: '<>', x: { $: '<x>', a: '<1:x,a>' } });
        expect(j('x:{a:1,b:B}'))
            .toEqual({ $: '<>', x: { $: '<x>', a: '<1:x,a>', b: '<B:x,b>' } });
        expect(j('x:{a:1,b:B,c:true}'))
            .toEqual({
            $: '<>',
            x: { $: '<x>', a: '<1:x,a>', b: '<B:x,b>', c: '<true:x,c>' }
        });
        expect(j('y:x:{a:1}'))
            .toEqual({ $: '<>', y: { $: '<y>', x: { $: '<y,x>', a: '<1:y,x,a>' } } });
        expect(j('y:x:{a:1,b:B}'))
            .toEqual({
            $: '<>',
            y: { $: '<y>', x: { $: '<y,x>', a: '<1:y,x,a>', b: '<B:y,x,b>' } }
        });
        expect(j('y:x:{a:1,b:B,c:true}'))
            .toEqual({
            $: '<>', y: {
                $: '<y>',
                x: { $: '<y,x>', a: '<1:y,x,a>', b: '<B:y,x,b>', c: '<true:y,x,c>' }
            }
        });
        expect(j('z:y:x:{a:1}'))
            .toEqual({
            $: '<>',
            z: { $: '<z>', y: { $: '<z,y>', x: { $: '<z,y,x>', a: '<1:z,y,x,a>' } } }
        });
        expect(j('z:y:x:{a:1,b:B}'))
            .toEqual({
            $: '<>',
            z: {
                $: '<z>',
                y: { $: '<z,y>', x: { $: '<z,y,x>', a: '<1:z,y,x,a>', b: '<B:z,y,x,b>' } }
            }
        });
        expect(j('z:y:x:{a:1,b:B,c:true}'))
            .toEqual({
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
    test('array', () => {
        const j = jsonic_next_1.Jsonic.make().use(path_1.Path).use((jsonic) => {
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
        expect(j('[]')).toEqual({ $: '<>' });
        expect(j('[1]')).toEqual({ $: '<>', 0: '<1:0>' });
        expect(j('[1,2]')).toEqual({ $: '<>', 0: '<1:0>', 1: '<2:1>' });
        expect(j('[1,2,3]')).toEqual({ $: '<>', 0: '<1:0>', 1: '<2:1>', 2: '<3:2>' });
        expect(j('[[]]')).toEqual({ $: '<>', 0: { $: '<0>' } });
        expect(j('[[1]]')).toEqual({ $: '<>', 0: { $: '<0>', 0: '<1:0,0>' } });
        expect(j('[[1,2]]'))
            .toEqual({ $: '<>', 0: { $: '<0>', 0: '<1:0,0>', 1: '<2:0,1>' } });
        expect(j('[[1,2,3]]'))
            .toEqual({ $: '<>', 0: { $: '<0>', 0: '<1:0,0>', 1: '<2:0,1>', 2: '<3:0,2>' } });
        expect(j('[[[]]]')).toEqual({ $: '<>', 0: { $: '<0>', 0: { $: '<0,0>' } } });
        expect(j('[[[1]]]'))
            .toEqual({ $: '<>', 0: { $: '<0>', 0: { $: '<0,0>', 0: '<1:0,0,0>' } } });
        expect(j('[[[1,2]]]'))
            .toEqual({
            $: '<>',
            0: { $: '<0>', 0: { $: '<0,0>', 0: '<1:0,0,0>', 1: '<2:0,0,1>' } }
        });
        expect(j('[[[1,2,3]]]'))
            .toEqual({
            $: '<>',
            0: {
                $: '<0>',
                0: { $: '<0,0>', 0: '<1:0,0,0>', 1: '<2:0,0,1>', 2: '<3:0,0,2>' }
            }
        });
    });
    test('transform', () => {
        const j = jsonic_next_1.Jsonic.make().use(path_1.Path).use((jsonic) => {
            jsonic.rule('val', rs => {
                rs
                    .ac(false, (r) => {
                    if ('object' !== typeof (r.node)) {
                        r.node = {
                            o: 'val',
                            v: r.node,
                            p: r.k.path,
                            // k: null == r.k.key ? r.k.index : r.k.key
                            k: r.k.key,
                        };
                    }
                    else {
                        r.node = {
                            o: Array.isArray(r.node) ? 'arr' : 'obj',
                            v: { ...r.node },
                            p: r.k.path,
                            // k: null == r.k.key ? r.k.index : r.k.key
                            k: r.k.key,
                        };
                    }
                });
            });
        });
        expect(j('{a:{b:1}}')).toEqual({
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
        expect(j('{a:{b:1,c:{d:{e:2}}},f:4}')).toEqual({
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
        expect(j('[a,b,c]')).toEqual({
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
        expect(j('[a,[b],{c:1,d:[2,3]}]')).toEqual({
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
    test('value', () => {
        const j = jsonic_next_1.Jsonic.make()
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
        expect(j('a:AAA')).toEqual({ a: { AAA: 1, k: 'a', p: ['a'] } });
    });
    test('expr', () => {
        const j = jsonic_next_1.Jsonic.make()
            .use(path_1.Path)
            .use(expr_1.Expr, {
            op: {
                'foo': {
                    infix: true, src: '%', left: 14000, right: 15000
                },
            },
            evaluate: (r, _op, terms) => {
                return { foo: terms[0] * terms[1], k: r.k.key, p: r.k.path };
            }
        });
        expect(j('a:2%3')).toEqual({ a: { foo: 6, k: 'a', p: ['a'] } });
    });
});
//# sourceMappingURL=path.test.js.map