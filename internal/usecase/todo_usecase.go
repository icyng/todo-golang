package usecase

import (
	"context"
	"time"

	"github.com/icyng/todo-golang/internal/domain"
)

type TodoUsecase struct {
	repo domain.TodoRepository
}

func NewTodoUsecase(repo domain.TodoRepository) *TodoUsecase {
	return &TodoUsecase{repo: repo}
}

func (u *TodoUsecase) List(ctx context.Context) ([]domain.Todo, error) {
	return u.repo.List(ctx)
}

func (u *TodoUsecase) Get(ctx context.Context, id uint) (domain.Todo, error) {
	return u.repo.Get(ctx, id)
}

func (u *TodoUsecase) Create(ctx context.Context, title string, priority uint8, dueAt *time.Time) (domain.Todo, error) {
	todo := domain.Todo{Title: title, Done: false, Priority: priority, DueAt: dueAt}
	if err := u.repo.Create(ctx, &todo); err != nil {
		return domain.Todo{}, err
	}
	return todo, nil
}

func (u *TodoUsecase) Update(
	ctx context.Context,
	id uint,
	title string,
	done bool,
	priority *uint8,
	dueAt *time.Time,
	dueAtSet bool,
) (domain.Todo, error) {
	todo, err := u.repo.Get(ctx, id)
	if err != nil {
		return domain.Todo{}, err
	}

	todo.Title = title
	todo.Done = done

	if priority != nil {
		todo.Priority = *priority
	}
	if dueAtSet {
		todo.DueAt = dueAt
	}

	if err := u.repo.Update(ctx, &todo); err != nil {
		return domain.Todo{}, err
	}
	return todo, nil
}

func (u *TodoUsecase) Delete(ctx context.Context, id uint) error {
	if _, err := u.repo.Get(ctx, id); err != nil {
		return err
	}
	return u.repo.Delete(ctx, id)
}
