import { Sequelize } from "sequelize";
import { configEnv } from "../config/configEnv.js";

export const sequelize = new Sequelize(
    configEnv.DB.DB_NAME,
    configEnv.DB.DB_USER,
    configEnv.DB.DB_PASSWORD,
    {
        host: configEnv.DB.DB_HOST,
        dialect: configEnv.DB.DB_DIALECT,
    }
)


export const connectDB = async () => {
    try {
        await sequelize.sync({ force: false });
        console.log('Se ha conectado a la base de datos');
    } catch (error) {
        console.error('Conexión fallida:', error);
    }
}