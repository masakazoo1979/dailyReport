# Variables
PROJECT_ID := claudecode1-482612
REGION := asia-northeast1
SERVICE_NAME := daily-report
IMAGE_NAME := gcr.io/$(PROJECT_ID)/$(SERVICE_NAME)
PORT := 3000

# Cloud SQL settings
SQL_INSTANCE := daily-report-db
SQL_DATABASE := daily_report
SQL_USER := daily_report_user
SQL_TIER := db-f1-micro

# Service Account settings
SA_NAME := github-actions
SA_EMAIL := $(SA_NAME)@$(PROJECT_ID).iam.gserviceaccount.com

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

# ================================
# Production Setup Commands
# ================================

.PHONY: setup-cloudsql
setup-cloudsql: ## Create Cloud SQL instance
	@echo "$(BLUE)Creating Cloud SQL instance...$(NC)"
	@if gcloud sql instances describe $(SQL_INSTANCE) --project=$(PROJECT_ID) > /dev/null 2>&1; then \
		echo "$(YELLOW)Cloud SQL instance $(SQL_INSTANCE) already exists$(NC)"; \
	else \
		gcloud sql instances create $(SQL_INSTANCE) \
			--database-version=POSTGRES_16 \
			--tier=$(SQL_TIER) \
			--region=$(REGION) \
			--storage-auto-increase \
			--backup-start-time=03:00 \
			--project=$(PROJECT_ID); \
		echo "$(GREEN)Cloud SQL instance created successfully!$(NC)"; \
	fi

.PHONY: setup-db
setup-db: ## Create database and user (requires DB_PASSWORD env var)
	@echo "$(BLUE)Creating database and user...$(NC)"
	@if [ -z "$(DB_PASSWORD)" ]; then \
		echo "$(YELLOW)Error: DB_PASSWORD environment variable is required$(NC)"; \
		exit 1; \
	fi
	@gcloud sql databases create $(SQL_DATABASE) \
		--instance=$(SQL_INSTANCE) \
		--project=$(PROJECT_ID) 2>/dev/null || echo "$(YELLOW)Database $(SQL_DATABASE) may already exist$(NC)"
	@gcloud sql users create $(SQL_USER) \
		--instance=$(SQL_INSTANCE) \
		--password=$(DB_PASSWORD) \
		--project=$(PROJECT_ID) 2>/dev/null || echo "$(YELLOW)User $(SQL_USER) may already exist$(NC)"
	@echo "$(GREEN)Database setup complete!$(NC)"

.PHONY: setup-secrets
setup-secrets: ## Register secrets in Secret Manager (requires DATABASE_URL, SESSION_SECRET env vars)
	@echo "$(BLUE)Setting up Secret Manager...$(NC)"
	@if [ -z "$(DATABASE_URL)" ] || [ -z "$(SESSION_SECRET)" ]; then \
		echo "$(YELLOW)Error: DATABASE_URL and SESSION_SECRET environment variables are required$(NC)"; \
		exit 1; \
	fi
	@echo -n "$(DATABASE_URL)" | gcloud secrets create DATABASE_URL \
		--data-file=- \
		--replication-policy="automatic" \
		--project=$(PROJECT_ID) 2>/dev/null || \
		(echo -n "$(DATABASE_URL)" | gcloud secrets versions add DATABASE_URL \
			--data-file=- \
			--project=$(PROJECT_ID) && echo "$(YELLOW)Updated existing DATABASE_URL secret$(NC)")
	@echo -n "$(SESSION_SECRET)" | gcloud secrets create SESSION_SECRET \
		--data-file=- \
		--replication-policy="automatic" \
		--project=$(PROJECT_ID) 2>/dev/null || \
		(echo -n "$(SESSION_SECRET)" | gcloud secrets versions add SESSION_SECRET \
			--data-file=- \
			--project=$(PROJECT_ID) && echo "$(YELLOW)Updated existing SESSION_SECRET secret$(NC)")
	@echo "$(GREEN)Secrets registered successfully!$(NC)"

.PHONY: setup-service-account
setup-service-account: ## Create service account for GitHub Actions
	@echo "$(BLUE)Creating service account for GitHub Actions...$(NC)"
	@gcloud iam service-accounts create $(SA_NAME) \
		--display-name="GitHub Actions" \
		--project=$(PROJECT_ID) 2>/dev/null || echo "$(YELLOW)Service account $(SA_NAME) may already exist$(NC)"
	@echo "$(BLUE)Granting necessary roles...$(NC)"
	@gcloud projects add-iam-policy-binding $(PROJECT_ID) \
		--member="serviceAccount:$(SA_EMAIL)" \
		--role="roles/run.admin" --quiet
	@gcloud projects add-iam-policy-binding $(PROJECT_ID) \
		--member="serviceAccount:$(SA_EMAIL)" \
		--role="roles/storage.admin" --quiet
	@gcloud projects add-iam-policy-binding $(PROJECT_ID) \
		--member="serviceAccount:$(SA_EMAIL)" \
		--role="roles/iam.serviceAccountUser" --quiet
	@gcloud projects add-iam-policy-binding $(PROJECT_ID) \
		--member="serviceAccount:$(SA_EMAIL)" \
		--role="roles/cloudsql.client" --quiet
	@echo "$(GREEN)Service account setup complete!$(NC)"

.PHONY: setup-secret-access
setup-secret-access: ## Grant secret access to Cloud Run service account
	@echo "$(BLUE)Granting secret access to Cloud Run...$(NC)"
	@PROJECT_NUMBER=$$(gcloud projects describe $(PROJECT_ID) --format='value(projectNumber)') && \
	gcloud secrets add-iam-policy-binding DATABASE_URL \
		--member="serviceAccount:$$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
		--role="roles/secretmanager.secretAccessor" \
		--project=$(PROJECT_ID) --quiet && \
	gcloud secrets add-iam-policy-binding SESSION_SECRET \
		--member="serviceAccount:$$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
		--role="roles/secretmanager.secretAccessor" \
		--project=$(PROJECT_ID) --quiet
	@echo "$(GREEN)Secret access granted!$(NC)"

.PHONY: setup-monitoring
setup-monitoring: ## Enable Cloud Logging and Monitoring APIs
	@echo "$(BLUE)Enabling Cloud Logging and Monitoring...$(NC)"
	@gcloud services enable logging.googleapis.com --project=$(PROJECT_ID)
	@gcloud services enable monitoring.googleapis.com --project=$(PROJECT_ID)
	@gcloud services enable cloudtrace.googleapis.com --project=$(PROJECT_ID)
	@echo "$(GREEN)Monitoring services enabled!$(NC)"

.PHONY: create-sa-key
create-sa-key: ## Create service account key for GitHub Secrets
	@echo "$(BLUE)Creating service account key...$(NC)"
	@gcloud iam service-accounts keys create gcp-sa-key.json \
		--iam-account=$(SA_EMAIL) \
		--project=$(PROJECT_ID)
	@echo "$(GREEN)Key saved to gcp-sa-key.json$(NC)"
	@echo "$(YELLOW)IMPORTANT: Add the contents of gcp-sa-key.json to GitHub Secrets as GCP_SA_KEY$(NC)"
	@echo "$(YELLOW)IMPORTANT: Delete gcp-sa-key.json after adding to GitHub Secrets$(NC)"

.PHONY: setup-production
setup-production: setup-cloudsql setup-service-account setup-monitoring ## Full production setup (requires DB_PASSWORD, DATABASE_URL, SESSION_SECRET env vars)
	@echo "$(BLUE)Running full production setup...$(NC)"
	@if [ -n "$(DB_PASSWORD)" ]; then $(MAKE) setup-db; fi
	@if [ -n "$(DATABASE_URL)" ] && [ -n "$(SESSION_SECRET)" ]; then \
		$(MAKE) setup-secrets; \
		$(MAKE) setup-secret-access; \
	fi
	@echo "$(GREEN)Production setup complete!$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Run 'make create-sa-key' to generate the service account key"
	@echo "  2. Add the key contents to GitHub Secrets as GCP_SA_KEY"
	@echo "  3. Run 'make deploy-full' to deploy the application"

.PHONY: verify-setup
verify-setup: ## Verify production setup status
	@echo "$(BLUE)Verifying production setup...$(NC)"
	@echo ""
	@echo "Cloud SQL Instance:"
	@gcloud sql instances describe $(SQL_INSTANCE) --project=$(PROJECT_ID) --format="table(name,state,region)" 2>/dev/null || echo "  $(YELLOW)Not found$(NC)"
	@echo ""
	@echo "Secrets:"
	@gcloud secrets list --project=$(PROJECT_ID) --filter="name:(DATABASE_URL OR SESSION_SECRET)" --format="table(name,replication.automatic)" 2>/dev/null || echo "  $(YELLOW)None found$(NC)"
	@echo ""
	@echo "Service Account:"
	@gcloud iam service-accounts describe $(SA_EMAIL) --project=$(PROJECT_ID) --format="table(email,displayName)" 2>/dev/null || echo "  $(YELLOW)Not found$(NC)"
	@echo ""
	@echo "Cloud Run Service:"
	@gcloud run services describe $(SERVICE_NAME) --region=$(REGION) --project=$(PROJECT_ID) --format="table(status.url)" 2>/dev/null || echo "  $(YELLOW)Not deployed$(NC)"
