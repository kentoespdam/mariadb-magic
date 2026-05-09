package browser

import "os/exec"

func OpenURL(url string) error {
	var cmd *exec.Cmd
	switch {
	case detectWSL():
		cmd = exec.Command("cmd", "/C", "start", "", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	return cmd.Start()
}

func detectWSL() bool {
	return false
}
