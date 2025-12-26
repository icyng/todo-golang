package domain

import "context"

type TodoRepository interface {
	List(ctx context.Context) ([]Todo, error)
	Get(ctx context.Context, id uint) (Todo, error)
	Create(ctx context.Context, todo *Todo) error
	Update(ctx context.Context, todo *Todo) error
	Delete(ctx context.Context, id uint) error
}
