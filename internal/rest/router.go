package rest

import "github.com/gin-gonic/gin"

func RegisterRoutes(r *gin.Engine, h *TodoHandler) {
	v1 := r.Group("/api/v1")
	{
		v1.GET("/todos", h.List)
		v1.GET("/todos/:id", h.Get)
		v1.POST("/todos", h.Create)
		v1.PUT("/todos/:id", h.Update)
		v1.DELETE("/todos/:id", h.Delete)
	}
}
