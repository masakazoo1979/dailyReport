# Variables
PROJECT_ID := claudecode1-482612
REGION := asia-northeast1
SERVICE_NAME := daily-report
IMAGE_NAME := gcr.io/$(PROJECT_ID)/$(SERVICE_NAME)
PORT := 3000

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

.PHONY: help
help: ## Display this help message
	@echo "$(BLUE)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

.PHONY: install
install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install

.PHONY: dev
dev: ## Start development server
	@echo "$(BLUE)Starting development server...$(NC)"
	npm run dev

.PHONY: build
build: ## Build Next.js application
	@echo "$(BLUE)Building application...$(NC)"
	npm run build

.PHONY: test
test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	npm run test -- --run

.PHONY: test-e2e
test-e2e: ## Run E2E tests
	@echo "$(BLUE)Running E2E tests...$(NC)"
	npm run test:e2e

.PHONY: lint
lint: ## Run linter
	@echo "$(BLUE)Running linter...$(NC)"
	npm run lint

.PHONY: format
format: ## Format code with Prettier
	@echo "$(BLUE)Formatting code...$(NC)"
	npm run format

.PHONY: type-check
type-check: ## Run TypeScript type check
	@echo "$(BLUE)Running type check...$(NC)"
	npm run type-check

.PHONY: prisma-generate
prisma-generate: ## Generate Prisma Client
	@echo "$(BLUE)Generating Prisma Client...$(NC)"
	npx prisma generate

.PHONY: prisma-migrate
prisma-migrate: ## Run Prisma migrations
	@echo "$(BLUE)Running Prisma migrations...$(NC)"
	npx prisma migrate deploy

.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(BLUE)Building Docker image...$(NC)"
	docker build -t $(IMAGE_NAME):latest .

.PHONY: docker-run
docker-run: ## Run Docker container locally
	@echo "$(BLUE)Running Docker container...$(NC)"
	docker run -p $(PORT):$(PORT) \
		-e DATABASE_URL=${DATABASE_URL} \
		-e SESSION_SECRET=${SESSION_SECRET} \
		$(IMAGE_NAME):latest

.PHONY: docker-push
docker-push: ## Push Docker image to GCR
	@echo "$(BLUE)Pushing Docker image to GCR...$(NC)"
	docker push $(IMAGE_NAME):latest

.PHONY: gcloud-auth
gcloud-auth: ## Authenticate with Google Cloud
	@echo "$(BLUE)Authenticating with Google Cloud...$(NC)"
	gcloud auth login
	gcloud config set project $(PROJECT_ID)

.PHONY: gcloud-configure-docker
gcloud-configure-docker: ## Configure Docker for GCR
	@echo "$(BLUE)Configuring Docker for GCR...$(NC)"
	gcloud auth configure-docker

.PHONY: deploy-build
deploy-build: ## Build and push Docker image
	@echo "$(BLUE)Building and pushing Docker image...$(NC)"
	gcloud builds submit --tag $(IMAGE_NAME):latest

.PHONY: deploy
deploy: ## Deploy to Cloud Run
	@echo "$(BLUE)Deploying to Cloud Run...$(NC)"
	gcloud run deploy $(SERVICE_NAME) \
		--image $(IMAGE_NAME):latest \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--port $(PORT) \
		--memory 512Mi \
		--cpu 1 \
		--min-instances 0 \
		--max-instances 10 \
		--set-env-vars "NODE_ENV=production" \
		--set-env-vars "PORT=$(PORT)"
	@echo "$(GREEN)Deployment complete!$(NC)"

.PHONY: deploy-full
deploy-full: deploy-build deploy ## Build, push and deploy to Cloud Run
	@echo "$(GREEN)Full deployment complete!$(NC)"

.PHONY: logs
logs: ## View Cloud Run logs
	@echo "$(BLUE)Fetching Cloud Run logs...$(NC)"
	gcloud run services logs read $(SERVICE_NAME) --region $(REGION) --limit 50

.PHONY: describe
describe: ## Describe Cloud Run service
	@echo "$(BLUE)Describing Cloud Run service...$(NC)"
	gcloud run services describe $(SERVICE_NAME) --region $(REGION)

.PHONY: delete
delete: ## Delete Cloud Run service
	@echo "$(YELLOW)Deleting Cloud Run service...$(NC)"
	gcloud run services delete $(SERVICE_NAME) --region $(REGION)

.PHONY: clean
clean: ## Clean build artifacts
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf .next
	rm -rf node_modules
	rm -rf coverage
	rm -rf test-results
	rm -rf playwright-report

.PHONY: ci
ci: install lint type-check test build ## Run CI checks locally
	@echo "$(GREEN)CI checks passed!$(NC)"
