/* Copyright (c) 2022-2025 Richard Rodger and other contributors, MIT License */

package path

import (
	jsonic "github.com/jsonicjs/jsonic/go"
)

type PathOptions struct{}

// Path is a Jsonic plugin that tracks the property path to the current
// location during parsing. The path is stored in Rule.K["path"] as a
// []any slice of string keys and int indices.
func Path(j *jsonic.Jsonic, opts map[string]any) {

	j.Rule("val", func(rs *jsonic.RuleSpec) {
		rs.BO = append(rs.BO, func(r *jsonic.Rule, ctx *jsonic.Context) {
			if r.D == 0 {
				var base []any
				if ctx.Meta != nil {
					if pm, ok := ctx.Meta["path"].(map[string]any); ok {
						if b, ok := pm["base"].([]any); ok {
							base = make([]any, len(b))
							copy(base, b)
						}
					}
				}
				if base == nil {
					base = []any{}
				}
				r.K["path"] = base
			}
		})
	})

	j.Rule("map", func(rs *jsonic.RuleSpec) {
		rs.BO = append(rs.BO, func(r *jsonic.Rule, ctx *jsonic.Context) {
			delete(r.K, "index")
		})
	})

	j.Rule("pair", func(rs *jsonic.RuleSpec) {
		rs.AO = append(rs.AO, func(r *jsonic.Rule, ctx *jsonic.Context) {
			if r.D > 0 && r.U["pair"] != nil {
				key := r.U["key"]
				parentPath := toPathSlice(r.K["path"])
				childPath := make([]any, len(parentPath)+1)
				copy(childPath, parentPath)
				childPath[len(parentPath)] = key
				r.Child.K["path"] = childPath
				r.Child.K["key"] = key
			}
		})
	})

	j.Rule("list", func(rs *jsonic.RuleSpec) {
		rs.BO = append(rs.BO, func(r *jsonic.Rule, ctx *jsonic.Context) {
			r.K["index"] = -1
		})
	})

	j.Rule("elem", func(rs *jsonic.RuleSpec) {
		rs.AO = append(rs.AO, func(r *jsonic.Rule, ctx *jsonic.Context) {
			if r.D > 0 {
				idx := 0
				if v, ok := r.K["index"].(int); ok {
					idx = v + 1
				}
				r.K["index"] = idx
				parentPath := toPathSlice(r.K["path"])
				childPath := make([]any, len(parentPath)+1)
				copy(childPath, parentPath)
				childPath[len(parentPath)] = idx
				r.Child.K["path"] = childPath
				r.Child.K["key"] = idx
				r.Child.K["index"] = idx
			}
		})
	})
}

// MakeJsonic creates a Jsonic parser instance with the Path plugin.
func MakeJsonic() *jsonic.Jsonic {
	j := jsonic.Make()
	j.Use(Path, nil)
	return j
}

func toPathSlice(v any) []any {
	if p, ok := v.([]any); ok {
		return p
	}
	return []any{}
}
