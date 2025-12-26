package usecase

import (
	"context"
	"testing"

	"github.com/icyng/todo-golang/internal/domain"
)

// domain.TodoRepository のスタブ
type stubTodoRepo struct {
	createCalled bool
	createArg    *domain.Todo
	createErr    error
	createdID    uint
}

// --- domain.TodoRepository を満たすためのメソッド群 ---

func (s *stubTodoRepo) List(ctx context.Context) ([]domain.Todo, error) {
	return nil, nil
}

func (s *stubTodoRepo) Get(ctx context.Context, id uint) (domain.Todo, error) {
	return domain.Todo{}, domain.ErrTodoNotFound
}

func (s *stubTodoRepo) Create(ctx context.Context, todo *domain.Todo) error {
	s.createCalled = true
	s.createArg = todo
	if s.createdID != 0 {
		// DBがIDを採番した想定
		todo.ID = s.createdID
	}
	return s.createErr
}

func (s *stubTodoRepo) Update(ctx context.Context, todo *domain.Todo) error {
	return nil
}

func (s *stubTodoRepo) Delete(ctx context.Context, id uint) error {
	return nil
}

// --- テスト本体 ---

func TestTodoUsecase_Create(t *testing.T) {
	repo := &stubTodoRepo{createdID: 123}
	uc := NewTodoUsecase(repo)

	todo, err := uc.Create(context.Background(), "hello")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !repo.createCalled {
		t.Fatalf("expected repo.Create to be called")
	}
	if repo.createArg == nil {
		t.Fatalf("expected createArg to be set")
	}

	// usecase が組み立てた内容の確認
	if repo.createArg.Title != "hello" {
		t.Fatalf("expected title 'hello', got %q", repo.createArg.Title)
	}
	if repo.createArg.Done != false {
		t.Fatalf("expected done=false, got %v", repo.createArg.Done)
	}

	// 返り値に ID が反映されているか（ポインタで渡している効果）
	if todo.ID != 123 {
		t.Fatalf("expected id=123, got %d", todo.ID)
	}
}
