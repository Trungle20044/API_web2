module.exports = {
    DBConnectors: {
        host: process.env.DB_HOST || "db4free.net",
        port: process.env.DB_PORT || 3306,
        username: process.env.DB_USER || "trungle224",
        password: process.env.DB_PASSWORD || "123123123!@#",
        database: process.env.DB_NAME || "databaseweb2",
        dialect: process.env.DB_DIALECT || "mysql",
    },
    jwtAuthKey: 'abcxyz',
    tokenLoginExpiredDays:'25 days'
};
