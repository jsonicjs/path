/* Copyright (c) 2022-2024 Richard Rodger, MIT License */

import { Jsonic, Plugin } from '@jsonic/jsonic-next'

type PathOptions = {}

/* Keeps track of the property path to the current location.
 * Example: {a:{b:1 ## path=["a","b"]
 * Use the Rule.k key-value store so that the path is propagated to children and followers.
 * Depth must be greater than 0 - ensures path only starts once top level implicit is set up.
 */
const Path: Plugin = (jsonic: Jsonic, _options: PathOptions) => {
  jsonic.rule('val', (rs) => {
    rs.bo((r, ctx) => {
      // At top level, create path array, or inherit from meta context.
      if (0 === r.d) {
        r.k.path = ctx.meta.path?.base?.slice(0) || []
      }
    })
  })

  jsonic.rule('map', (rs) => {
    rs.bo((r) => {
      // Not in an array, so no need to track element index.
      delete r.k.index
    })
  })

  jsonic.rule('pair', (rs) => {
    rs.ao((r) => {
      if (0 < r.d && r.u.pair) {
        r.child.k.path = [...r.k.path, r.u.key]
        r.child.k.key = r.u.key
      }
    })
  })

  jsonic.rule('list', (rs) => {
    rs.bo((r) => {
      // In array, the path property is the element index.
      r.k.index = -1
    })
  })

  jsonic.rule('elem', (rs) => {
    rs.ao((r) => {
      if (0 < r.d) {
        r.k.index = 1 + r.k.index
        r.child.k.path = [...r.k.path, r.k.index]
        r.child.k.key = r.k.index
        r.child.k.index = r.k.index
      }
    })
  })
}

Path.defaults = {} as PathOptions

export { Path }

export type { PathOptions }
