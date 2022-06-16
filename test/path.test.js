"use strict";
/* Copyright (c) 2021-2022 Richard Rodger and other contributors, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
const jsonic_next_1 = require("@jsonic/jsonic-next");
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
                        r.node = `<${r.node}:${r.keep.path}>`;
                    }
                    else {
                        r.node.$ = `<${r.keep.path}>`;
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
                        r.node = `<${r.node}:${r.keep.path}>`;
                    }
                    else {
                        r.node.$ = `<${r.keep.path}>`;
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
});
//# sourceMappingURL=path.test.js.map