resource "azurerm_service_plan" "consumption_plan" {
  name                = "${var.project_prefix}-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Windows"
  sku_name            = "Y1"
}

#resource "azurerm_service_plan" "lin_consumption_plan" {
#  name                = "${var.project_prefix}-linuxPlan"
#  location            = azurerm_resource_group.rg.location
#  resource_group_name = azurerm_resource_group.rg.name
#  os_type             = "Linux"
#  sku_name            = "Y1"
#}

resource "azurerm_storage_account" "func_storage" {
  name                     = "${var.project_prefix}funcstore"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# --- Azure Key Vault ---
# This assumes you have already created the secret named 'SendGridApiKey'
# in Azure Key Vault manually or via another process.
resource "azurerm_key_vault" "kv" {
  name                = var.azure_key_vault_name # Must be globally unique
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tenant_id           = var.tenant_id
  sku_name            = "standard"

  # Required for Azure Functions to reference secrets
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  
}

resource "azurerm_key_vault_access_policy" "github_actions" {
  key_vault_id = azurerm_key_vault.kv.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = data.azurerm_client_config.current.object_id # <-- Your GitHub Actions SP Object ID

  secret_permissions = [
    "Get",
    "Set",
    "List"
  ]
  key_permissions = [
      "Get", "List", "Create", "Delete"
  ]
}

resource "time_sleep" "wait_for_kv_policy_propagation" {
  # This duration can be adjusted. 30 seconds is often enough,
  # but sometimes 60 seconds might be needed for very slow regions/deployments.
  create_duration = "80s"

  # Crucially, this sleep resource must depend on the Key Vault being created
  # so that the policy is already applied before the timer starts.
  depends_on = [azurerm_key_vault.kv]
}

resource "azurerm_key_vault_secret" "sg_secret" {
  name         = var.azure_sendgrid_secret_name
  value        = var.azure_sendgrid_secret_val
  key_vault_id = azurerm_key_vault.kv.id
  depends_on = [time_sleep.wait_for_kv_policy_propagation]
}


resource "azurerm_windows_function_app" "fetchSummary" {
  name                       = "${var.project_prefix}-fetchsummary"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  service_plan_id            = azurerm_service_plan.consumption_plan.id
  storage_account_name       = azurerm_storage_account.func_storage.name
  storage_account_access_key = azurerm_storage_account.func_storage.primary_access_key
  #source_code_hash           = filebase64sha256("./terraform/azure/fetchSummary.zip")
  site_config {
    ftps_state = "Disabled"

    cors {
      allowed_origins = ["*"] # ["https://${azurerm_storage_account.static_web.name}.z13.web.core.windows.net"]
      support_credentials = false
    }

    application_stack {
      node_version = "~22"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME       = "node"
    FUNCTIONS_EXTENSION_VERSION     = "~4"
    SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
    DB_ENDPOINT     = azurerm_cosmosdb_account.cosmos.endpoint
    DB_ID           = azurerm_cosmosdb_sql_database.database.name
    DB_KEY          = azurerm_cosmosdb_account.cosmos.primary_key
    DB_SUMMCONTAINERID    = azurerm_cosmosdb_sql_container.sent_analysis.name
    AZQUEUE_NAME                   = azurerm_storage_queue.notification.name
    AZQUEUE_URL                    = "https://${azurerm_storage_account.queue.name}.queue.core.windows.net/${azurerm_storage_queue.notification.name}"
    PLATFORM                       = "azure"
    KEY_VAULT_URL                  = azurerm_key_vault.kv.vault_uri
    CLIENT_ID                      = var.client_id
        
  }

  tags = {
    Environment = "Development"
  }
  depends_on = [azurerm_storage_queue.notification]
}
resource "azurerm_windows_function_app" "sendNotification" {
  name                       = "${var.project_prefix}-sendNotification"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  service_plan_id            = azurerm_service_plan.consumption_plan.id
  storage_account_name       = azurerm_storage_account.func_storage.name
  storage_account_access_key = azurerm_storage_account.func_storage.primary_access_key
  #source_code_hash           = filebase64sha256("./terraform/azure/sendNotification.zip")
  site_config {
    ftps_state = "Disabled"
   
    application_stack {
      node_version = "~22"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {  
    FUNCTIONS_WORKER_RUNTIME       = "node"
    FUNCTIONS_EXTENSION_VERSION     = "~4"
    SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
    FROM_EMAIL                     = var.from_email_address
    TO_EMAIL                       = var.to_email_address
    SENDGRID_API_KEY               = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.kv.vault_uri}/secrets/${var.azure_sendgrid_secret_name}/)"
    AZQUEUE_NAME                   = azurerm_storage_queue.notification.name
    AZQUEUE_URL                    = "https://${azurerm_storage_account.queue.name}.queue.core.windows.net/${azurerm_storage_queue.notification.name}"
    PLATFORM                       = "azure"
    KEY_VAULT_URL                  = azurerm_key_vault.kv.vault_uri
    CLIENT_ID                      = var.client_id
  }

  tags = {
    Environment = "Development"
  }
  depends_on = [azurerm_storage_queue.notification]
}


resource "azurerm_windows_function_app" "sentimentAnalyzer" {
  name                       = "${var.project_prefix}-sentimentAnalyzer"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  service_plan_id            = azurerm_service_plan.consumption_plan.id
  storage_account_name       = azurerm_storage_account.func_storage.name
  storage_account_access_key = azurerm_storage_account.func_storage.primary_access_key
  #source_code_hash           = filebase64sha256("./terraform/azure/sentimentAnalyzer.zip")

  site_config {
    ftps_state = "Disabled"
   
    application_stack {
      node_version = "~22"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME       = "node"
    FUNCTIONS_EXTENSION_VERSION     = "~4"
    #WEBSITE_NODE_DEFAULT_VERSION   = "22"
    #WEBSITE_RUN_FROM_PACKAGE       = "1" 
    SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
    AzureWebJobsStorage   = azurerm_storage_account.func_storage.primary_connection_string    

    AZQUEUE_URL     = "https://${azurerm_storage_account.queue.name}.queue.core.windows.net/${azurerm_storage_queue.notification.name}"
    DB_ENDPOINT     = azurerm_cosmosdb_account.cosmos.endpoint
    DB_ID           = azurerm_cosmosdb_sql_database.database.name
    DB_KEY          = azurerm_cosmosdb_account.cosmos.primary_key
    DB_CONTAINERID        = azurerm_cosmosdb_sql_container.cust_review.name
    DB_SUMMCONTAINERID    = azurerm_cosmosdb_sql_container.sent_analysis.name
           
    AZQUEUE_NAME                   = azurerm_storage_queue.notification.name
    #AZQUEUE_URL                    = azurerm_storage_queue.notification.url
    PLATFORM                       = "azure"
    APPID                          = "123"
    KEY_VAULT_URL                  = azurerm_key_vault.kv.vault_uri
    CLIENT_ID                      = var.client_id
  }

  tags = {
    Environment = "Development"
  }
}
# --- Azure Key Vault Secret Access Policy for the Function App's Managed Identity ---
resource "azurerm_key_vault_access_policy" "func_app_secret_get" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = var.tenant_id
  object_id    = azurerm_windows_function_app.sendNotification.identity[0].principal_id

  secret_permissions = [
    "Get", # Allow the Function App to get the secret val
    "List" 
  ]
}


#resource "azurerm_linux_function_app" "fetchReview" {
#  name                       = "${var.project_prefix}-fetchreview"
#  location                   = azurerm_resource_group.rg.location
#  resource_group_name        = azurerm_resource_group.rg.name
#  service_plan_id            = azurerm_service_plan.lin_consumption_plan.id
#  storage_account_name       = azurerm_storage_account.func_storage.name
#  storage_account_access_key = azurerm_storage_account.func_storage.primary_access_key

#  site_config {
#    ftps_state = "Disabled"
    
#    application_stack {
#      node_version = "22"
#    }
#  }

#  identity {
#    type = "SystemAssigned"
#  }

#  app_settings = {
#    FUNCTIONS_WORKER_RUNTIME       = "node"
#    FUNCTIONS_EXTENSION_VERSION     = "~4"
#    #WEBSITE_NODE_DEFAULT_VERSION   = "20"
#    #WEBSITE_RUN_FROM_PACKAGE       = "1"
#    SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
#    ENABLE_ORYX_BUILD = true
        
#  }

#  tags = {
#    Environment = "Development"
#  }
  
#}
# Duplicate and modify for fetchSummary and sendEmailNotification function
