#!/bin/bash
set -e

BUCKET_NAME="mcloud-code-bucket"
FUNCTIONS=("sentimentAnalyzer" "fetchSummary" "sendNotification")

# Cleanup old zip files
echo "🧹 Removing old zip files in $(pwd)..."
rm -f ./*.zip

for func in "${FUNCTIONS[@]}"; do
  FUNC_DIR=../../functions/$func

  echo "📦 Building $func..."

  cd $FUNC_DIR

  # Ensure PLATFORM is set for build context
  export PLATFORM=aws

  # Remove Azure-specific packages if they exist
  echo "Pruning Azure dependencies (if any)..."
  
  npm uninstall @azure/cosmos @azure/identity @azure/keyvault-secrets @azure/msal-node @azure/storage-queue @azure/functions || true
  
  echo "Installing node_modules.."

  npm install --silent

  # Build using tsconfig.aws.json
  echo "Building TypeScript with tsconfig.aws.json..."
  npx tsc --project tsconfig.aws.json

  # Run build, allow failures to continue
  #npm run build || echo "$func build failed — continuing..."

  #npm prune --omit=dev

  # Package the dist folder only
  cd dist
  ZIP_PATH=../../../terraform/aws/$func.zip
  echo "📁 Zipping dist/ to $ZIP_PATH..."
  zip -r $ZIP_PATH . -x "*.test.js"
  # Package the node_module and other files
  cd ..
  ZIP_NEW_PATH=../../terraform/aws/$func.zip >/dev/null
  echo "📁 Zipping node_modules to $ZIP_PATH..."
  zip -g "$ZIP_NEW_PATH" -r node_modules package.json package-lock.json >/dev/null
  # Upload to S3
  echo "☁️ Uploading $func.zip to s3://$BUCKET_NAME/$func.zip..."
  aws s3 cp $ZIP_NEW_PATH s3://$BUCKET_NAME/$func.zip

  # Go back to the main directory
  cd $FUNC_DIR
  #cd - >/dev/null
done

echo "✅ All functions built and uploaded."

