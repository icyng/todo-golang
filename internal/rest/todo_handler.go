package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/icyng/todo-golang/internal/usecase"
)

type TodoHandler struct {
	uc *usecase.TodoUsecase
}

func NewTodoHandler(uc *usecase.TodoUsecase) *TodoHandler {
	return &TodoHandler{uc: uc}
}

func (h *TodoHandler) List(c *gin.Context) {
	todos, err := h.uc.List(c.Request.Context())
	if handleDomainError(c, err) {
		return
	}
	c.JSON(http.StatusOK, todos)
}

func (h *TodoHandler) Get(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	todo, err := h.uc.Get(c.Request.Context(), id)
	if handleDomainError(c, err) {
		return
	}

	c.JSON(http.StatusOK, todo)
}

func (h *TodoHandler) Create(c *gin.Context) {
	var req createTodoRequest
	if err := c.ShouldBindJSON(&req); handleBadRequest(c, err) {
		return
	}

	todo, err := h.uc.Create(c.Request.Context(), req.Title)
	if handleDomainError(c, err) {
		return
	}

	c.JSON(http.StatusCreated, todo)
}

func (h *TodoHandler) Update(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	var req updateTodoRequest
	if err := c.ShouldBindJSON(&req); handleBadRequest(c, err) {
		return
	}

	todo, err := h.uc.Update(c.Request.Context(), id, req.Title, *req.Done)
	if handleDomainError(c, err) {
		return
	}

	c.JSON(http.StatusOK, todo)
}

func (h *TodoHandler) Delete(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	if err := h.uc.Delete(c.Request.Context(), id); handleDomainError(c, err) {
		return
	}

	c.Status(http.StatusNoContent)
}
