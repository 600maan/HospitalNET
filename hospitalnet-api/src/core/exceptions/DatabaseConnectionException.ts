class DatabaseConnectionException extends Error {
    constructor(message?: string) {
        super(message || "Database connection error. Please make sure database is running.")
    }
}

export default DatabaseConnectionException
