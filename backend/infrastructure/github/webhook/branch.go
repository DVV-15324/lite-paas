package webhook

import "strings"

func (h *WebhookHandler) isMainBranch(ref string) bool {
	return strings.HasPrefix(ref, "refs/heads/main") ||
		strings.HasPrefix(ref, "refs/heads/master")
}

func (h *WebhookHandler) extractBranch(ref string) string {
	parts := strings.Split(ref, "/")
	if len(parts) >= 3 {
		return parts[2]
	}
	return "main"
}
