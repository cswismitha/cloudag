#!/bin/bash
set -e

# Ensure this script runs from terraform/azure
echo "Running Azure source zip build from $(pwd)"

# List of Azure Functions
FUNCTIONS=("sentimentAnalyzer" "fetchSummary" "sendNotification" "fetchreview")

# Define paths
FUNCTIONS_BASE_DIR="../../functions"
ZIP_OUTPUT_DIR="$(pwd)"  # Ensure output stays in terraform/azure

# Cleanup old zip files
echo "🧹 Removing old zip files in $ZIP_OUTPUT_DIR..."
rm -f "$ZIP_OUTPUT_DIR"/*.zip

# Loop through each function and build zip
for func in "${FUNCTIONS[@]}"; do
  FUNC_SRC="$FUNCTIONS_BASE_DIR/$func"
  ZIP_NAME="$func.zip"
  ZIP_PATH="$ZIP_OUTPUT_DIR/$ZIP_NAME"

  echo "📦 Zipping $func from $FUNC_SRC..."

  if [ ! -d "$FUNC_SRC" ]; then
    echo "❌ Directory $FUNC_SRC not found. Skipping..."
    continue
  fi

   # Rename tsconfig.azure.json → tsconfig.json
  if [ -f "$FUNC_SRC/tsconfig.azure.json" ]; then
    echo "🔄 Renaming tsconfig.azure.json to tsconfig.json"
    mv "$FUNC_SRC/tsconfig.azure.json" "$FUNC_SRC/tsconfig.json"
  fi

  # Create zip from function root and write directly to terraform/azure
  (cd "$FUNC_SRC" && zip -r "$ZIP_PATH" . -x "node_modules/*" "dist/*" "tsconfig.aws.json" > /dev/null)

   # Restore the original filename
  if [ -f "$FUNC_SRC/tsconfig.json" ]; then
    mv "$FUNC_SRC/tsconfig.json" "$FUNC_SRC/tsconfig.azure.json"
  fi

  echo "✅ Created $ZIP_PATH"
done

# List the final outputs
echo "📂 Final zip files:"
ls -lh "$ZIP_OUTPUT_DIR"/*.zip
