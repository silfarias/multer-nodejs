import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";
import path from "path/posix";


export const Files = sequelize.define('files', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isDirectory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // por defecto, se considera archivo
    }
}, {
    timestamps: true,
    tablename: 'files'
})
