interface Config {
    app: AppConfig
    db: DatabaseConfig
    auth: AuthConfig
}

interface AppConfig {
    port: number
    environment: "production" | "development"
    app_debug: boolean
    swagger_document_path?: string
    channel_name?: string
    smart_contract_name?: string
    connection_profile_path?: string
    wallet_path?: string
    certificate_authority?: string
    msp_organisation?: string
    enrollment_user_id?: string
    enrollment_admin_id?: string
    enrollment_admin_secret?: string

}

interface DatabaseConfig {
    db_name?: string
    db_host?: string
    db_port?: number
    db_user?: string
    db_pass?: string
    db_url?: string
}

interface AuthConfig {
    hashRounds: number,
    tokenExpiry: number
    jwt_secret: string

    request: {
        usernameField: string,
        passwordField: string,
    }

    authenticationHandler: (username: string, password: string, callback: any) => Promise<void>
    tokenAuthenticationHandler: (jwtPayload: any, done: any) => Promise<void>
}
