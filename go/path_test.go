/* Copyright (c) 2022-2025 Richard Rodger and other contributors, MIT License */

package path

import (
	"fmt"
	"reflect"
	"strings"
	"testing"

	jsonic "github.com/jsonicjs/jsonic/go"
)

func assert(t *testing.T, name string, got, want any) {
	t.Helper()
	if !reflect.DeepEqual(got, want) {
		t.Errorf("%s:\n  got:  %#v\n  want: %#v", name, got, want)
	}
}

// addPathCapture adds a val AC callback that annotates nodes with path info.
func addPathCapture(j *jsonic.Jsonic) {
	j.Rule("val", func(rs *jsonic.RuleSpec) {
		rs.AC = append(rs.AC, func(r *jsonic.Rule, ctx *jsonic.Context) {
			path := toPathSlice(r.K["path"])
			switch node := r.Node.(type) {
			case map[string]any:
				node["$"] = fmtPath(path)
			case []any:
				// Leave arrays as-is; elements are already annotated.
			default:
				r.Node = fmtValPath(r.Node, path)
			}
		})
	})
}

func TestHappy(t *testing.T) {
	j := MakeJsonic()
	result, err := j.Parse("{a:{b:1,c:[2,3]}}")
	if err != nil {
		t.Fatal(err)
	}
	m := result.(map[string]any)
	a := m["a"].(map[string]any)
	assert(t, "b", a["b"], float64(1))
}

func TestPathTracking(t *testing.T) {
	j := jsonic.Make()
	j.Use(Path, nil)
	addPathCapture(j)

	result, err := j.Parse("{a:{b:1}}")
	if err != nil {
		t.Fatal(err)
	}

	m := result.(map[string]any)
	assert(t, "root-path", m["$"], "<>")

	a := m["a"].(map[string]any)
	assert(t, "a-path", a["$"], "<a>")
	assert(t, "b-val", a["b"], "<1:a,b>")
}

func TestMetaBasePath(t *testing.T) {
	j := jsonic.Make()
	j.Use(Path, nil)

	j.Rule("val", func(rs *jsonic.RuleSpec) {
		rs.AC = append(rs.AC, func(r *jsonic.Rule, ctx *jsonic.Context) {
			path := toPathSlice(r.K["path"])
			if node, ok := r.Node.(map[string]any); ok {
				node["$"] = fmtPath(path)
			}
		})
	})

	result, err := j.ParseMeta("{a:1}", map[string]any{
		"path": map[string]any{
			"base": []any{"x", "y"},
		},
	})
	if err != nil {
		t.Fatal(err)
	}

	m := result.(map[string]any)
	assert(t, "root", m["$"], "<x,y>")
}

func TestObjectPaths(t *testing.T) {
	j := jsonic.Make()
	j.Use(Path, nil)
	addPathCapture(j)

	result, err := j.Parse("{a:1}")
	if err != nil {
		t.Fatal(err)
	}
	m := result.(map[string]any)
	assert(t, "root", m["$"], "<>")
	assert(t, "a", m["a"], "<1:a>")

	result, err = j.Parse("{a:1,b:B}")
	if err != nil {
		t.Fatal(err)
	}
	m = result.(map[string]any)
	assert(t, "root2", m["$"], "<>")
	assert(t, "a2", m["a"], "<1:a>")
	assert(t, "b2", m["b"], "<B:b>")
}

func TestNestedObjectPaths(t *testing.T) {
	j := jsonic.Make()
	j.Use(Path, nil)
	addPathCapture(j)

	result, err := j.Parse("{x:{a:1}}")
	if err != nil {
		t.Fatal(err)
	}
	m := result.(map[string]any)
	assert(t, "root", m["$"], "<>")
	x := m["x"].(map[string]any)
	assert(t, "x", x["$"], "<x>")
	assert(t, "x-a", x["a"], "<1:x,a>")
}

func TestArrayPaths(t *testing.T) {
	j := jsonic.Make()
	j.Use(Path, nil)
	addPathCapture(j)

	result, err := j.Parse("[1,2,3]")
	if err != nil {
		t.Fatal(err)
	}

	arr, ok := result.([]any)
	if !ok {
		t.Fatalf("expected []any, got %T", result)
	}
	assert(t, "elem-0", arr[0], "<1:0>")
	assert(t, "elem-1", arr[1], "<2:1>")
	assert(t, "elem-2", arr[2], "<3:2>")
}

func TestMakeJsonic(t *testing.T) {
	j := MakeJsonic()
	result, err := j.Parse("{a:1}")
	if err != nil {
		t.Fatal(err)
	}
	m, ok := result.(map[string]any)
	if !ok {
		t.Fatalf("expected map, got %T", result)
	}
	assert(t, "a", m["a"], float64(1))
}

// fmtPath formats a path slice as "<a,b,c>".
func fmtPath(path []any) string {
	parts := make([]string, len(path))
	for i, p := range path {
		parts[i] = fmtKey(p)
	}
	return "<" + strings.Join(parts, ",") + ">"
}

// fmtValPath formats a value with its path as "<value:a,b>".
func fmtValPath(val any, path []any) string {
	parts := make([]string, len(path))
	for i, p := range path {
		parts[i] = fmtKey(p)
	}
	return "<" + fmtVal(val) + ":" + strings.Join(parts, ",") + ">"
}

func fmtKey(v any) string {
	switch k := v.(type) {
	case string:
		return k
	case int:
		return fmt.Sprintf("%d", k)
	case float64:
		if k == float64(int64(k)) {
			return fmt.Sprintf("%d", int64(k))
		}
		return fmt.Sprintf("%g", k)
	default:
		return fmt.Sprintf("%v", v)
	}
}

func fmtVal(v any) string {
	switch val := v.(type) {
	case string:
		return val
	case float64:
		if val == float64(int64(val)) {
			return fmt.Sprintf("%d", int64(val))
		}
		return fmt.Sprintf("%g", val)
	case bool:
		return fmt.Sprintf("%t", val)
	default:
		return fmt.Sprintf("%v", v)
	}
}
