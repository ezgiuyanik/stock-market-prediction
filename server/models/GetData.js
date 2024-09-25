module.exports = (sequelize, DataTypes) => {
    const Data = sequelize.define("tbl_dolar", {
        Tarih: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        Şimdi : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Açılış: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Yüksek: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Düşük: {
            type: DataTypes.STRING,
            allowNull: false,
        },

    });
    return Data; 
};