package rules

import (
	"fmt"
	"reflect"
	"regexp"
	"strconv"
)

func inSlice(val any, list any) bool {
	rv := reflect.ValueOf(list)
	if rv.Kind() != reflect.Slice && rv.Kind() != reflect.Array {
		return false
	}
	for i := 0; i < rv.Len(); i++ {
		if reflect.DeepEqual(val, rv.Index(i).Interface()) {
			return true
		}
	}
	return false
}

func inRange(val any, rangeVal any) bool {
	min, max, ok := parseRange(rangeVal)
	if !ok {
		return false
	}
	f, err := toFloat64(val)
	if err != nil {
		return false
	}
	return f >= min && f <= max
}

func matchRegex(val any, pattern any) bool {
	s, ok := pattern.(string)
	if !ok {
		return false
	}
	re, err := regexp.Compile(s)
	if err != nil {
		return false
	}
	return re.MatchString(fmt.Sprintf("%v", val))
}

func parseRange(rv any) (min, max float64, ok bool) {
	v := reflect.ValueOf(rv)
	if v.Kind() != reflect.Slice && v.Kind() != reflect.Array || v.Len() != 2 {
		return
	}
	min, err1 := toFloat64(v.Index(0).Interface())
	max, err2 := toFloat64(v.Index(1).Interface())
	if err1 != nil || err2 != nil {
		return
	}
	ok = true
	return
}

func castValue(val any, to string) any {
	if val == nil {
		return nil
	}
	switch to {
	case "string":
		return fmt.Sprintf("%v", val)
	case "bool":
		return toBool(val)
	case "int":
		f, err := toFloat64(val)
		if err != nil {
			return val
		}
		return int(f)
	case "float":
		f, err := toFloat64(val)
		if err != nil {
			return val
		}
		return f
	}
	return val
}

func toBool(v any) bool {
	switch x := v.(type) {
	case bool:
		return x
	case int, int8, int16, int32, int64:
		return reflect.ValueOf(x).Int() != 0
	case uint, uint8, uint16, uint32, uint64:
		return reflect.ValueOf(x).Uint() != 0
	case float32, float64:
		return reflect.ValueOf(x).Float() != 0
	case string:
		return x == "1" || x == "true" || x == "yes"
	}
	return false
}

func toFloat64(v any) (float64, error) {
	switch n := v.(type) {
	case int, int8, int16, int32, int64:
		return float64(reflect.ValueOf(n).Int()), nil
	case uint, uint8, uint16, uint32, uint64:
		return float64(reflect.ValueOf(n).Uint()), nil
	case float32:
		return float64(n), nil
	case float64:
		return n, nil
	case string:
		return strconv.ParseFloat(n, 64)
	}
	return 0, fmt.Errorf("unsupported type %T", v)
}
