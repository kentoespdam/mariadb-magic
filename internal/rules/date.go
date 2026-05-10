package rules

import (
	"time"
)

func translateDate(d *DateRule) func(any) (any, error) {
	return func(v any) (any, error) {
		if v == nil {
			return nil, nil
		}
		s := fmtValue(v)
		t, err := time.ParseInLocation(d.InputLayout, s, time.UTC)
		if err != nil {
			switch d.OnError {
			case DateErrorNull:
				return nil, nil
			case DateErrorKeepOriginal:
				return v, nil
			case DateErrorFailRow:
				return nil, TranslateError{SourceValue: v, Message: "invalid date format: " + err.Error()}
			}
		}
		return t.Format(d.OutputLayout), nil
	}
}
