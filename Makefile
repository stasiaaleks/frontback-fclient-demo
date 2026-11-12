-include .env

.PHONY: help install dev-server dev-client build start seed test lint db-up db-down db-reset db-shell

help:
	@echo "Available targets:"
	@echo "  install    - Install server and client dependencies"
	@echo "  dev-server - Start the API with auto-restart (http://localhost:$(PORT))"
	@echo "  dev-client - Start Vite dev server, proxies /api (http://localhost:5173)"
	@echo "  build      - Build the React app into client/dist"
	@echo "  start      - Serve API + built app on one port (run build first)"
	@echo "  seed       - Replace all articles and users with sample data"
	@echo "  test       - Run server smoke tests"
	@echo "  lint       - Lint server and client"
	@echo "  db-up      - Start MongoDB container"
	@echo "  db-down    - Stop MongoDB container"
	@echo "  db-reset   - Reset MongoDB (delete data)"
	@echo "  db-shell   - Open mongosh in the MongoDB container"

install:
	npm --prefix server install
	npm --prefix client install

dev-server:
	npm --prefix server run dev

dev-client:
	npm --prefix client run dev

build:
	npm --prefix client run build

start:
	npm --prefix server start

seed:
	npm --prefix server run seed

test:
	npm --prefix server test

lint:
	npm --prefix server run lint
	npm --prefix client run lint

db-up:
	docker compose up -d

db-down:
	docker compose down

db-reset:
	docker compose down -v

db-shell:
	docker compose exec mongodb mongosh "mongodb://$(MONGO_USER):$(MONGO_PASSWORD)@localhost:27017/fatclient_db?authSource=admin"
