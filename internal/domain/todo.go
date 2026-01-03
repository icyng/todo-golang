package domain

import "time"

type Todo struct {
	ID        uint       `json:"id"`
	Title     string     `json:"title"`
	Done      bool       `json:"done"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Priority  uint8      `json:"priority" gorm:"not null;default:3"`
	DueAt     *time.Time `json:"due_at"`
}
