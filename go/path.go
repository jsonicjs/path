/* Copyright (c) 2022-2026 Richard Rodger and other contributors, MIT License */

package path

import (
	jsonic "github.com/jsonicjs/jsonic/go"
)

const Version = "0.1.1"

type PathOptions struct{}

// --- BEGIN EMBEDDED path-grammar.jsonic ---
const grammarText = `
# Path Grammar Definition
# Declares rule names so @<rulename>-<phase> refs auto-wire as state actions.
# Parsed by a standard Jsonic instance and passed to jsonic.grammar().

{
  rule: {
    val:  {}
    map:  {}
    pair: {}
    list: {}
    elem: {}
  }
}
`
// --- END EMBEDDED path-grammar.jsonic ---

// Path is a Jsonic plugin that tracks the property path to the current
// location during parsing. The path is stored in Rule.K["path"] as a
// []any slice of string keys and int indices.
func Path(j *jsonic.Jsonic, opts map[string]any) error {
	refs := map[jsonic.FuncRef]any{
		"@val-bo": jsonic.StateAction(func(r *jsonic.Rule, ctx *jsonic.Context) {
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
		}),

		"@map-bo": jsonic.StateAction(func(r *jsonic.Rule, ctx *jsonic.Context) {
			delete(r.K, "index")
		}),

		"@pair-ao": jsonic.StateAction(func(r *jsonic.Rule, ctx *jsonic.Context) {
			if r.D > 0 && r.U["pair"] != nil {
				key := r.U["key"]
				parentPath := toPathSlice(r.K["path"])
				childPath := make([]any, len(parentPath)+1)
				copy(childPath, parentPath)
				childPath[len(parentPath)] = key
				r.Child.K["path"] = childPath
				r.Child.K["key"] = key
			}
		}),

		"@list-bo": jsonic.StateAction(func(r *jsonic.Rule, ctx *jsonic.Context) {
			r.K["index"] = -1
		}),

		"@elem-ao": jsonic.StateAction(func(r *jsonic.Rule, ctx *jsonic.Context) {
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
		}),

	}

	parsed, err := jsonic.Make().Parse(grammarText)
	if err != nil {
		return err
	}
	gsMap, _ := parsed.(map[string]any)
	ruleMap, _ := gsMap["rule"].(map[string]any)
	gsRule := make(map[string]*jsonic.GrammarRuleSpec, len(ruleMap))
	for name := range ruleMap {
		gsRule[name] = &jsonic.GrammarRuleSpec{}
	}

	return j.Grammar(
		&jsonic.GrammarSpec{Ref: refs, Rule: gsRule},
		&jsonic.GrammarSetting{
			Rule: &jsonic.GrammarSettingRule{
				Alt: &jsonic.GrammarSettingAlt{G: "path"},
			},
		},
	)
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
