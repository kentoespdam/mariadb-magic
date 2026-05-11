package api

const (
	CodeValidationFailed         string = "VALIDATION_FAILED"
	CodeNotFound                 string = "NOT_FOUND"
	CodeConflict                 string = "CONFLICT"
	CodeConflictRunningSession   string = "CONFLICT_RUNNING_SESSION"
	CodeConflictReferenced        string = "CONFLICT_REFERENCED"
	CodeInternal                 string = "INTERNAL"
	CodeBadRequest                string = "BAD_REQUEST"
	CodeUnauthorized             string = "UNAUTHORIZED"
	CodeMethodNotAllowed         string = "METHOD_NOT_ALLOWED"
)