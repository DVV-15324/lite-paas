// entity/push_event.go
package entity

// Entity
type PushEvent struct {
	Ref    string `json:"ref"`
	Pusher struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"pusher"`
	Repository struct {
		FullName string `json:"full_name"`
		Name     string `json:"name"`
		CloneURL string `json:"clone_url"`
		Owner    struct {
			Name string `json:"name"`
		} `json:"owner"`
	} `json:"repository"`
}
