# DocVerify - Document Verification & Audit Log System

A secure document verification system that generates and stores document hashes while maintaining comprehensive audit logs using Azure services.

## Features

- **Document Upload**: Secure file upload with integrity verification
- **Hash Generation**: SHA-256 hash generation for document integrity
- **Document Verification**: Compare uploaded documents against stored hashes
- **Audit Logging**: Comprehensive audit trail for all operations
- **Azure Integration**: Uses Azure Blob Storage and Cosmos DB
- **Dockerized**: Full containerization with NGINX reverse proxy
- **CI/CD Pipeline**: GitHub Actions for automated deployment

## Architecture

- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express
- **Storage**: Azure Blob Storage for documents
- **Database**: Azure Cosmos DB for hashes and audit logs
- **Reverse Proxy**: NGINX for routing
- **Deployment**: Azure Container Instances + Static Web Apps

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Azure account with active subscription

### Local Development

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd trusty-docs
   ```

2. **Backend setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your Azure credentials in .env
   ```

3. **Frontend setup**:
   ```bash
   cd ..
   npm install
   ```

4. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

5. **Access the application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000/api
   - Direct Backend: http://localhost:3000

## Azure Setup Guide

### 1. Create Azure Resources

#### Storage Account
```bash
# Create resource group
az group create --name trusty-docs-rg --location eastus

# Create storage account
az storage account create \
  --name trustydocsstorage \
  --resource-group trusty-docs-rg \
  --location eastus \
  --sku Standard_LRS

# Get connection string
az storage account show-connection-string \
  --name trustydocsstorage \
  --resource-group trusty-docs-rg
```

#### Cosmos DB
```bash
# Create Cosmos DB account
az cosmosdb create \
  --name trusty-docs-cosmos \
  --resource-group trusty-docs-rg \
  --default-consistency-level Session

# Get connection details
az cosmosdb keys list \
  --name trusty-docs-cosmos \
  --resource-group trusty-docs-rg
```

#### Container Registry
```bash
# Create container registry
az acr create \
  --resource-group trusty-docs-rg \
  --name trustydocsregistry \
  --sku Basic \
  --admin-enabled true
```

### 2. Environment Configuration

Update your `.env` file:

```env
# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...

# Cosmos DB
COSMOS_ENDPOINT=https://trusty-docs-cosmos.documents.azure.com:443/
COSMOS_KEY=your_cosmos_primary_key
COSMOS_DATABASE_NAME=trusty-docs
COSMOS_CONTAINER_HASHES=document-hashes
COSMOS_CONTAINER_LOGS=audit-logs

# Server
PORT=3000
NODE_ENV=production
```

### 3. GitHub Secrets

Configure these secrets in your GitHub repository:

```
AZURE_REGISTRY_LOGIN_SERVER=trustydocsregistry.azurecr.io
AZURE_REGISTRY_USERNAME=trustydocsregistry
AZURE_REGISTRY_PASSWORD=<registry_password>
AZURE_RESOURCE_GROUP=trusty-docs-rg
AZURE_STORAGE_CONNECTION_STRING=<storage_connection_string>
COSMOS_ENDPOINT=<cosmos_endpoint>
COSMOS_KEY=<cosmos_key>
AZURE_STATIC_WEB_APPS_API_TOKEN=<static_web_apps_token>
```

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload document
- `POST /api/documents/verify/:documentId` - Verify document
- `GET /api/documents` - List all documents
- `GET /api/documents/:documentId` - Get document details
- `DELETE /api/documents/:documentId` - Delete document

### Audit
- `GET /api/audit/logs` - Get audit logs
- `GET /api/audit/logs/:documentId` - Get document audit logs
- `GET /api/audit/stats` - Get system statistics
- `GET /api/audit/timeline` - Get activity timeline

## Security Features

- File type validation
- File size limits (50MB)
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- Comprehensive audit logging

## Deployment

### Manual Deployment

1. **Build and push images**:
   ```bash
   # Backend
   docker build -t trustydocsregistry.azurecr.io/trusty-docs-backend ./backend
   docker push trustydocsregistry.azurecr.io/trusty-docs-backend

   # Frontend
   docker build -t trustydocsregistry.azurecr.io/trusty-docs-frontend .
   docker push trustydocsregistry.azurecr.io/trusty-docs-frontend
   ```

2. **Deploy to Azure Container Instances**:
   ```bash
   az container create \
     --resource-group trusty-docs-rg \
     --name trusty-docs-backend \
     --image trustydocsregistry.azurecr.io/trusty-docs-backend \
     --registry-login-server trustydocsregistry.azurecr.io \
     --registry-username trustydocsregistry \
     --registry-password <password> \
     --dns-name-label trusty-docs-api \
     --ports 3000 \
     --environment-variables NODE_ENV=production PORT=3000 \
     --secure-environment-variables \
       AZURE_STORAGE_CONNECTION_STRING="<connection_string>" \
       COSMOS_ENDPOINT="<cosmos_endpoint>" \
       COSMOS_KEY="<cosmos_key>"
   ```

### Automated Deployment

Push to `main` branch triggers automatic deployment via GitHub Actions.

## Monitoring

- Application logs via Winston
- Azure Monitor integration
- Health check endpoints
- Audit trail in Cosmos DB

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
npm test
```

### Code Structure
```
trusty-docs/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Azure services
│   │   ├── utils/           # Utilities
│   │   └── server.js        # Main server
│   ├── Dockerfile
│   └── package.json
├── src/                     # Frontend React app
├── .github/workflows/       # CI/CD pipeline
├── docker-compose.yml
└── nginx.conf
```
![Project Screenshot](public/Screenshot%202025-12-25%20at%2020.01.00.png)


## 🔗 Live Demo

[🚀 View Live Application](https://docverify-azure.onrender.com)


