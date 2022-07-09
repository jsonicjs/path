/* Copyright (c) 2022 Richard Rodger, MIT License */

import { Jsonic, Plugin } from '@jsonic/jsonic-next'

type PathOptions = {}

const Path: Plugin = (jsonic: Jsonic, _options: PathOptions) => {
  jsonic.rule('val', (rs) => {
    rs.bo((r) => {
      if (0 === r.d) {
        r.keep.path = []
      }
    })
  })

  // TODO: fix type chaining with jsonic.rule
  jsonic.rule('map', (rs) => {
    rs
      // .bo(r => { r.keep.index = -1 })
      .bo((r) => {
        delete r.keep.index
      })
  })

  jsonic.rule('pair', (rs) => {
    rs.ao((r) => {
      if (0 < r.d && r.use.pair) {
        r.child.keep.path = [...r.keep.path, r.use.key]
        r.child.keep.key = r.use.key
      }
    })
  })

  jsonic.rule('list', (rs) => {
    rs.bo((r) => {
      r.keep.index = -1
    })
  })

  jsonic.rule('elem', (rs) => {
    rs.ao((r) => {
      if (0 < r.d) {
        r.keep.index = 1 + r.keep.index
        r.child.keep.path = [...r.keep.path, r.keep.index]
        r.child.keep.key = r.keep.index
        r.child.keep.index = r.keep.index
      }
    })
  })
}

Path.defaults = {} as PathOptions

export { Path }

export type { PathOptions }
