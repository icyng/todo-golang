package rest

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func parseUintParam(c *gin.Context, name string) (uint, bool) {
	v := c.Param(name)
	id64, err := strconv.ParseUint(v, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid " + name})
		return 0, false
	}
	return uint(id64), true
}
