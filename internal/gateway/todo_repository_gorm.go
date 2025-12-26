package gateway

import (
	"context"

	"errors"

	"gorm.io/gorm"

	"github.com/icyng/todo-golang/internal/domain"
)

type TodoRepositoryGorm struct {
	db *gorm.DB
}

func NewTodoRepositoryGorm(db *gorm.DB) *TodoRepositoryGorm {
	return &TodoRepositoryGorm{db: db}
}

func (r *TodoRepositoryGorm) List(ctx context.Context) ([]domain.Todo, error) {
	var todos []domain.Todo
	if err := r.db.WithContext(ctx).Order("id asc").Find(&todos).Error; err != nil {
		return nil, err
	}
	return todos, nil
}

func (r *TodoRepositoryGorm) Get(ctx context.Context, id uint) (domain.Todo, error) {
	var todo domain.Todo
	err := r.db.WithContext(ctx).First(&todo, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Todo{}, domain.ErrTodoNotFound
		}
		return domain.Todo{}, err
	}
	return todo, nil
}

func (r *TodoRepositoryGorm) Create(ctx context.Context, todo *domain.Todo) error {
	return r.db.WithContext(ctx).Create(todo).Error
}

func (r *TodoRepositoryGorm) Update(ctx context.Context, todo *domain.Todo) error {
	return r.db.WithContext(ctx).Save(todo).Error
}

func (r *TodoRepositoryGorm) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&domain.Todo{}, id).Error
}
