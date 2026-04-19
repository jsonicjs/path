/* Copyright (c) 2022-2024 Richard Rodger, MIT License */

import { Jsonic, Plugin, Rule, Context } from 'jsonic'

type PathOptions = {}

/* Keeps track of the property path to the current location.
 * Example: {a:{b:1 ## path=["a","b"]
 * Use the Rule.k key-value store so that the path is propagated to children and followers.
 * Depth must be greater than 0 - ensures path only starts once top level implicit is set up.
 */
const Path: Plugin = (jsonic: Jsonic, _options: PathOptions) => {
  jsonic.grammar({
    ref: {
      '@val-bo': (r: Rule, ctx: Context) => {
        // At top level, create path array, or inherit from meta context.
        if (0 === r.d) {
          r.k.path = ctx.meta.path?.base?.slice(0) || []
        }
      },

      '@map-bo': (r: Rule) => {
        // Not in an array, so no need to track element index.
        delete r.k.index
      },

      '@pair-ao': (r: Rule) => {
        if (0 < r.d && r.u.pair) {
          r.child.k.path = [...r.k.path, r.u.key]
          r.child.k.key = r.u.key
        }
      },

      '@list-bo': (r: Rule) => {
        // In array, the path property is the element index.
        r.k.index = -1
      },

      '@elem-ao': (r: Rule) => {
        if (0 < r.d) {
          r.k.index = 1 + r.k.index
          r.child.k.path = [...r.k.path, r.k.index]
          r.child.k.key = r.k.index
          r.child.k.index = r.k.index
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
  })
}

Path.defaults = {} as PathOptions

export { Path }

export type { PathOptions }
