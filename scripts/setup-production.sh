#!/bin/bash

# Cloud Run Production Setup Script
# This script helps you set up the production environment for the Daily Report application

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (can be overridden with environment variables)
PROJECT_ID="${GCP_PROJECT_ID:-claudecode1-482612}"
REGION="asia-northeast1"
SQL_INSTANCE="daily-report-db"
SQL_DATABASE="daily_report"
SQL_USER="daily_report_user"
SERVICE_NAME="daily-report"
SA_NAME="github-actions"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Cloud Run Production Setup Script${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 &> /dev/null; then
    echo -e "${YELLOW}Not authenticated. Running gcloud auth login...${NC}"
    gcloud auth login
fi

# Set project
echo -e "${BLUE}Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# Check if project is accessible
if ! gcloud projects describe ${PROJECT_ID} &> /dev/null; then
    echo -e "${RED}Error: Cannot access project ${PROJECT_ID}${NC}"
    echo "Please ensure you have the necessary permissions."
    exit 1
fi

echo -e "${GREEN}Prerequisites check passed!${NC}"
echo ""

# Step 1: Cloud SQL Setup
echo -e "${BLUE}Step 1: Cloud SQL Setup${NC}"
echo "------------------------"

if gcloud sql instances describe ${SQL_INSTANCE} --project=${PROJECT_ID} &> /dev/null; then
    echo -e "${YELLOW}Cloud SQL instance ${SQL_INSTANCE} already exists${NC}"
else
    echo -e "${BLUE}Creating Cloud SQL instance...${NC}"
    read -p "Do you want to create Cloud SQL instance? (y/n): " create_sql
    if [ "$create_sql" = "y" ]; then
        gcloud sql instances create ${SQL_INSTANCE} \
            --database-version=POSTGRES_16 \
            --tier=db-f1-micro \
            --region=${REGION} \
            --storage-auto-increase \
            --backup-start-time=03:00 \
            --project=${PROJECT_ID}
        echo -e "${GREEN}Cloud SQL instance created!${NC}"
    fi
fi
echo ""

# Step 2: Database and User Setup
echo -e "${BLUE}Step 2: Database and User Setup${NC}"
echo "--------------------------------"

read -sp "Enter database password for ${SQL_USER}: " DB_PASSWORD
echo ""
read -sp "Confirm database password: " DB_PASSWORD_CONFIRM
echo ""

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}Error: Passwords do not match${NC}"
    exit 1
fi

if [ ${#DB_PASSWORD} -lt 12 ]; then
    echo -e "${RED}Error: Password must be at least 12 characters${NC}"
    exit 1
fi

# Create database
gcloud sql databases create ${SQL_DATABASE} \
    --instance=${SQL_INSTANCE} \
    --project=${PROJECT_ID} 2>/dev/null || echo -e "${YELLOW}Database ${SQL_DATABASE} may already exist${NC}"

# Create user
gcloud sql users create ${SQL_USER} \
    --instance=${SQL_INSTANCE} \
    --password="${DB_PASSWORD}" \
    --project=${PROJECT_ID} 2>/dev/null || echo -e "${YELLOW}User ${SQL_USER} may already exist${NC}"

echo -e "${GREEN}Database setup complete!${NC}"
echo ""

# Step 3: Secret Manager Setup
echo -e "${BLUE}Step 3: Secret Manager Setup${NC}"
echo "-----------------------------"

# Construct DATABASE_URL
DATABASE_URL="postgresql://${SQL_USER}:${DB_PASSWORD}@/daily_report?host=/cloudsql/${PROJECT_ID}:${REGION}:${SQL_INSTANCE}"

# Generate SESSION_SECRET
SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

echo -e "${BLUE}Registering secrets in Secret Manager...${NC}"

# DATABASE_URL
echo -n "${DATABASE_URL}" | gcloud secrets create DATABASE_URL \
    --data-file=- \
    --replication-policy="automatic" \
    --project=${PROJECT_ID} 2>/dev/null || \
    (echo -n "${DATABASE_URL}" | gcloud secrets versions add DATABASE_URL \
        --data-file=- \
        --project=${PROJECT_ID})

# SESSION_SECRET
echo -n "${SESSION_SECRET}" | gcloud secrets create SESSION_SECRET \
    --data-file=- \
    --replication-policy="automatic" \
    --project=${PROJECT_ID} 2>/dev/null || \
    (echo -n "${SESSION_SECRET}" | gcloud secrets versions add SESSION_SECRET \
        --data-file=- \
        --project=${PROJECT_ID})

echo -e "${GREEN}Secrets registered!${NC}"
echo ""

# Step 4: Service Account Setup
echo -e "${BLUE}Step 4: Service Account Setup${NC}"
echo "------------------------------"

gcloud iam service-accounts create ${SA_NAME} \
    --display-name="GitHub Actions" \
    --project=${PROJECT_ID} 2>/dev/null || echo -e "${YELLOW}Service account ${SA_NAME} may already exist${NC}"

echo -e "${BLUE}Granting necessary roles...${NC}"

for role in "roles/run.admin" "roles/storage.admin" "roles/iam.serviceAccountUser" "roles/cloudsql.client"; do
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${SA_EMAIL}" \
        --role="${role}" \
        --quiet 2>/dev/null
done

echo -e "${GREEN}Service account setup complete!${NC}"
echo ""

# Step 5: Secret Access for Cloud Run
echo -e "${BLUE}Step 5: Grant Secret Access to Cloud Run${NC}"
echo "-----------------------------------------"

PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')

for secret in "DATABASE_URL" "SESSION_SECRET"; do
    gcloud secrets add-iam-policy-binding ${secret} \
        --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" \
        --project=${PROJECT_ID} \
        --quiet 2>/dev/null
done

echo -e "${GREEN}Secret access granted!${NC}"
echo ""

# Step 6: Enable Monitoring
echo -e "${BLUE}Step 6: Enable Cloud Monitoring${NC}"
echo "--------------------------------"

gcloud services enable logging.googleapis.com --project=${PROJECT_ID}
gcloud services enable monitoring.googleapis.com --project=${PROJECT_ID}
gcloud services enable cloudtrace.googleapis.com --project=${PROJECT_ID}

echo -e "${GREEN}Monitoring services enabled!${NC}"
echo ""

# Step 7: Create Service Account Key
echo -e "${BLUE}Step 7: Create Service Account Key${NC}"
echo "-----------------------------------"

read -p "Do you want to create a service account key for GitHub Actions? (y/n): " create_key
if [ "$create_key" = "y" ]; then
    KEY_FILE="gcp-sa-key.json"
    gcloud iam service-accounts keys create ${KEY_FILE} \
        --iam-account=${SA_EMAIL} \
        --project=${PROJECT_ID}

    echo -e "${GREEN}Key saved to ${KEY_FILE}${NC}"
    echo -e "${YELLOW}IMPORTANT: Add the contents of ${KEY_FILE} to GitHub Secrets as GCP_SA_KEY${NC}"
    echo -e "${YELLOW}IMPORTANT: Delete ${KEY_FILE} after adding to GitHub Secrets${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Add the service account key to GitHub Secrets as GCP_SA_KEY"
echo "2. Run database migration: npx prisma migrate deploy"
echo "3. Deploy the application: make deploy-full"
echo "4. Verify the deployment: make verify-setup"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  make logs       - View Cloud Run logs"
echo "  make describe   - View service details"
echo "  make verify-setup - Verify setup status"
