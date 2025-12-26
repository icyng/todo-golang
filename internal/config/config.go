package config

import "os"

type Config struct {
	Port  string
	DBDSN string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "todo.db"
	}

	return Config{
		Port:  port,
		DBDSN: dsn,
	}
}
