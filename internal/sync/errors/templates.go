package errors

import (
	"regexp"
	"strconv"
	"strings"
)

func extractColumn(msg string) string {
	re := regexp.MustCompile(`column '(\w+)'`)
	matches := re.FindStringSubmatch(msg)
	if len(matches) > 1 {
		return matches[1]
	}
	re = regexp.MustCompile(`field '(\w+)'`)
	matches = re.FindStringSubmatch(msg)
	if len(matches) > 1 {
		return matches[1]
	}
	return "tidak diketahui"
}

func extractValue(msg string) string {
	re := regexp.MustCompile(`'([^']+)'`)
	matches := re.FindStringSubmatch(msg)
	if len(matches) > 1 {
		return matches[1]
	}
	return "tidak diketahui"
}

func extractUniqueKey(msg string) (string, string) {
	re := regexp.MustCompile(`for key '([^']+)'`)
	matches := re.FindStringSubmatch(msg)
	key := "unik"
	if len(matches) > 1 {
		key = matches[1]
	}
	re = regexp.MustCompile(`Duplicate entry '([^']+)'`)
	matches = re.FindStringSubmatch(msg)
	val := "yang sama"
	if len(matches) > 1 {
		val = matches[1]
	}
	return key, val
}

func extractFK(msg string) (string, string) {
	re := regexp.MustCompile(`foreign key constraint.*?\.(\w+)`)
	matches := re.FindStringSubmatch(msg)
	col := "referensi"
	if len(matches) > 1 {
		col = matches[1]
	}
	re = regexp.MustCompile(`'([^']+)'`)
	matches = re.FindStringSubmatch(msg)
	val := "tidak valid"
	if len(matches) > 1 {
		val = matches[1]
	}
	return col, val
}

func isEmoji(msg string) bool {
	emojiPattern := regexp.MustCompile(`\\xF[0-9A-F]{2}\\x[89AB][0-9A-F]{2}`)
	return emojiPattern.MatchString(msg) || strings.Contains(msg, "incorrect string value")
}

func truncate(s string, max int) string {
	if len(s) > max {
		return s[:max] + "..."
	}
	return s
}

func ParseCode(s string) int {
	code, _ := strconv.Atoi(s)
	return code
}
