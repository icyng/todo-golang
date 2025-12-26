AIR_VERSION := v1.61.0
AIR := github.com/air-verse/air@$(AIR_VERSION)

dev: ui-build
	go run $(AIR) -c .air.toml

ui-build:
	cd frontend && npm install && npm run build

run:
	go run ./cmd/api

test:
	go test ./...

fmt:
	gofmt -w .

tools:
	go install github.com/air-verse/air@$(AIR_VERSION)

dev-fast: tools
	$$(go env GOPATH)/bin/air -c .air.toml
