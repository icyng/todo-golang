package rest

type createTodoRequest struct {
	Title string `json:"title" binding:"required"`
}

type updateTodoRequest struct {
	Title string `json:"title" binding:"required"`
	Done  *bool  `json:"done" binding:"required"`
}
