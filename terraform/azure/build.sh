#!/bin/bash
set -e

# Include all functions
FUNCTIONS=("fetchSummary" "sendNotification" "sentimentAnalyzer")

# Start from terraform/azure
echo "Running build.sh from $(pwd)"

# Cleanup old zip files
echo "Removing old zip files in $(pwd)..."
rm -f ./*.zip

for func in "${FUNCTIONS[@]}"; do
  FUNC_PATH="../../functions/$func"
  ZIP_OUTPUT_PATH="./$func.zip"

  echo "Building $func from $FUNC_PATH"

  # Navigate to function directory or fail with message
  cd "$FUNC_PATH" || { echo "❌ Directory $FUNC_PATH not found"; exit 1; }
  
  export PLATFORM=azure
  echo "Pruning AWS dependencies (if any)..."
  #npm uninstall aws-sdk @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb || true
  # Install and build
  echo "Installing dependencies..."
  npm install --silent
  # ensure necessary package are installed
  #npm install @azure/cosmos @azure/identity @azure/keyvault-secrets @azure/msal-node

  echo "Compiling TypeScript using tsconfig.azure.json..."
  npx tsc --project tsconfig.azure.json

  #echo "Building TypeScript..."
    
  #npm prune --omit=dev
  
  # Create zip file
  echo "Zipping $func into $ZIP_OUTPUT_PATH..."
  zip -r "$ZIP_OUTPUT_PATH" dist node_modules host.json package.json package-lock.json .funcignore src/ >/dev/null

  echo "✅ Done building $func"

  # Return to terraform/azure directory
  cd - >/dev/null

  # Move zip to terraform/azure
  mv "$FUNC_PATH/$(basename $ZIP_OUTPUT_PATH)" .
done

# Show contents
echo "Final zip files in terraform/azure:"
ls -lh *.zip
