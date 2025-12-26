package di

import (
	"github.com/gin-gonic/gin"

	"github.com/icyng/todo-golang/internal/config"
	"github.com/icyng/todo-golang/internal/db"
	"github.com/icyng/todo-golang/internal/domain"
	"github.com/icyng/todo-golang/internal/gateway"
	"github.com/icyng/todo-golang/internal/rest"
	"github.com/icyng/todo-golang/internal/ui"
	"github.com/icyng/todo-golang/internal/usecase"
)

func BuildRouter(cfg config.Config) (*gin.Engine, error) {

	gormDB, err := db.New(cfg.DBDSN)
	if err != nil {
		return nil, err
	}

	if err := gormDB.AutoMigrate(&domain.Todo{}); err != nil {
		return nil, err
	}

	repo := gateway.NewTodoRepositoryGorm(gormDB)
	uc := usecase.NewTodoUsecase(repo)
	h := rest.NewTodoHandler(uc)

	r := gin.Default()

	if err := r.SetTrustedProxies(nil); err != nil {
		return nil, err
	}

	r.StaticFS("/ui", ui.FS())

	r.GET("/ui", func(c *gin.Context) {
		c.Redirect(302, "/ui/")
	})

	r.GET("/", func(c *gin.Context) {
		c.Redirect(302, "/ui/")
	})

	rest.RegisterRoutes(r, h)

	return r, nil
}
