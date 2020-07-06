interface ENV {
    APP_ENV: AppConfig["environment"]
    APP_PORT: AppConfig["port"]
    APP_DEBUG: AppConfig["app_debug"]
    JWT_SECRET: AuthConfig["jwt_secret"]
    SWAGGER_DOCUMENT_PATH:AppConfig["swagger_document_path"]
    
    //
    DB_NAME: DatabaseConfig["db_name"]
    DB_HOST: DatabaseConfig["db_host"]
    DB_PORT: DatabaseConfig["db_port"]
    DB_USER: DatabaseConfig["db_user"]
    DB_PASS: DatabaseConfig["db_pass"]
    DB_URL: DatabaseConfig["db_url"]    
    // 
    CHANNEL_NAME:AppConfig["channel_name"]
    SMART_CONTRACT_NAME:AppConfig["smart_contract_name"]
    CONNECTION_PROFILE_PATH:AppConfig["connection_profile_path"]
    WALLET_PATH:AppConfig["wallet_path"]
    CERTIFICATE_AUTHORITY:AppConfig["certificate_authority"]
    MSP_ORGANISATION:AppConfig["msp_organisation"]
    ENROLLMENT_USER_ID:AppConfig["enrollment_user_id"]
    ENROLLMENT_ADMIN_ID:AppConfig["enrollment_admin_id"]
    ENROLLMENT_ADMIN_SECRET:AppConfig["enrollment_admin_secret"] 
    
}
