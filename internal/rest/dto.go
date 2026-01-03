package rest

import (
	"bytes"
	"encoding/json"
	"time"
)

type updateTodoRequest struct {
	Title    string       `json:"title" binding:"required"`
	Done     *bool        `json:"done" binding:"required"`
	Priority *uint8       `json:"priority" binding:"omitempty,min=1,max=5"`
	DueAt    OptionalTime `json:"due_at"`
}

type createTodoRequest struct {
	Title    string     `json:"title" binding:"required"`
	Priority *uint8     `json:"priority" binding:"omitempty,min=1,max=5"`
	DueAt    *time.Time `json:"due_at"`
}

type OptionalTime struct {
	Time *time.Time
	Set  bool
}

func (o *OptionalTime) UnmarshalJSON(b []byte) error {
	o.Set = true
	if bytes.Equal(bytes.TrimSpace(b), []byte("null")) {
		o.Time = nil
		return nil
	}

	var t time.Time
	if err := json.Unmarshal(b, &t); err != nil {
		return err
	}
	o.Time = &t
	return nil
}
