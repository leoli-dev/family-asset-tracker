.PHONY: dev stop restart logs build setup help

## Start dev containers (builds if needed)
dev:
	docker compose up --build

## Start dev containers in the background
dev-bg:
	docker compose up --build -d

## Stop and remove containers
stop:
	docker compose down

## Restart all services
restart:
	docker compose restart

## Follow logs (all services); usage: make logs  or  make logs s=backend
logs:
	docker compose logs -f $(s)

## Rebuild images without cache
build:
	docker compose build --no-cache

## First-time setup: create .env from example if it doesn't exist
setup:
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "Created backend/.env — edit ACCESS_TOKEN before running 'make dev'"; \
	else \
		echo "backend/.env already exists, skipping."; \
	fi

help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@grep -E '^##' Makefile | sed 's/## /  /'
	@echo ""
