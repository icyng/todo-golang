package main

import (
	"log"

	"github.com/joho/godotenv"

	"github.com/icyng/todo-golang/internal/config"
	"github.com/icyng/todo-golang/internal/di"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	r, err := di.BuildRouter(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
