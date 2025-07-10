// preinstall.js
const { execSync } = require("child_process");

const platform = process.env.PLATFORM || "azure"; // default to Azure
console.log(`🔧 [preinstall] Running for platform: ${platform}`);

if (platform === "azure") {
  console.log("🧹 Removing AWS-specific packages for Azure build...");
  try {
    execSync("npm uninstall aws-sdk @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-secrets-manager @aws-sdk/client-sqs @aws-sdk/util-dynamodb", {
      stdio: "inherit"
    });
  } catch (e) {
    console.warn("⚠️ AWS packages may not be installed, skipping...");
  }
} else {
  console.log("✅ AWS build detected — keeping AWS SDKs");
}
