import pkg from 'sequelize';
const { Sequelize, DataTypes, Model } = pkg;
import {sequelize} from "./../src/connection.js";

class Click extends Model {}

Click.init({
    uuid : {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    x_position_percentage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    y_position_percentage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    device: {
        type: DataTypes.STRING,
        allowNull: false
    },
    route: {
        type: DataTypes.STRING,
        allowNull: false
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Click',
    tableName: 'clicks'
});

export default Click;