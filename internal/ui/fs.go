package ui

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed web/* web/assets/*
var embedded embed.FS

func FS() http.FileSystem {
	sub, err := fs.Sub(embedded, "web")
	if err != nil {
		panic(err)
	}
	return http.FS(sub)
}
