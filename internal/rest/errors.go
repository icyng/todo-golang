package rest

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/icyng/todo-golang/internal/domain"
)

func writeError(c *gin.Context, status int, msg string) {
	c.JSON(status, gin.H{"error": msg})
}

func handleBadRequest(c *gin.Context, err error) bool {
	if err == nil {
		return false
	}
	writeError(c, http.StatusBadRequest, err.Error())
	return true
}

func handleDomainError(c *gin.Context, err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, domain.ErrTodoNotFound) {
		writeError(c, http.StatusNotFound, "todo not found")
		return true
	}
	writeError(c, http.StatusInternalServerError, err.Error())
	return true
}
