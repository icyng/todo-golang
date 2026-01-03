package usecase

import (
	"context"
	"testing"
	"time"

	"github.com/icyng/todo-golang/internal/domain"
)

// domain.TodoRepository のスタブ
type stubTodoRepo struct {
	createCalled bool
	createArg    *domain.Todo
	createErr    error
	createdID    uint
	getCalled    bool
	getID        uint
	getTodo      domain.Todo
	getErr       error
	updateCalled bool
	updateArg    *domain.Todo
	updateErr    error
	deleteCalled bool
	deleteID     uint
	deleteErr    error
}

// --- domain.TodoRepository を満たすためのメソッド群 ---

func (s *stubTodoRepo) List(ctx context.Context) ([]domain.Todo, error) {
	return nil, nil
}

func (s *stubTodoRepo) Get(ctx context.Context, id uint) (domain.Todo, error) {
	s.getCalled = true
	s.getID = id
	if s.getErr != nil {
		return domain.Todo{}, s.getErr
	}
	return s.getTodo, nil
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
	s.updateCalled = true
	s.updateArg = todo
	return s.updateErr
}

func (s *stubTodoRepo) Delete(ctx context.Context, id uint) error {
	s.deleteCalled = true
	s.deleteID = id
	return s.deleteErr
}

// --- テスト本体 ---

func TestTodoUsecase_Create(t *testing.T) {
	repo := &stubTodoRepo{createdID: 123}
	uc := NewTodoUsecase(repo)

	todo, err := uc.Create(context.Background(), "hello", 2, nil)
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

func TestTodoUsecase_Update_ClearsDueAt(t *testing.T) {
	due := time.Date(2024, 1, 2, 3, 4, 5, 0, time.UTC)
	repo := &stubTodoRepo{
		getTodo: domain.Todo{
			ID:       1,
			Title:    "before",
			Done:     false,
			Priority: 3,
			DueAt:    &due,
		},
	}
	uc := NewTodoUsecase(repo)

	todo, err := uc.Update(context.Background(), 1, "after", true, nil, nil, true)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !repo.getCalled {
		t.Fatalf("expected repo.Get to be called")
	}
	if !repo.updateCalled {
		t.Fatalf("expected repo.Update to be called")
	}
	if repo.updateArg == nil {
		t.Fatalf("expected updateArg to be set")
	}
	if repo.updateArg.DueAt != nil {
		t.Fatalf("expected dueAt to be cleared, got %v", repo.updateArg.DueAt)
	}
	if todo.DueAt != nil {
		t.Fatalf("expected returned dueAt to be cleared, got %v", todo.DueAt)
	}
	if repo.updateArg.Title != "after" {
		t.Fatalf("expected title 'after', got %q", repo.updateArg.Title)
	}
	if repo.updateArg.Done != true {
		t.Fatalf("expected done=true, got %v", repo.updateArg.Done)
	}
}
