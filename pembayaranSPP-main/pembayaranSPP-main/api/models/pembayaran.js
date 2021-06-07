'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pembayaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pembayaran.belongsTo(models.petugas, {
        foreignKey:"id_petugas",
        as:"petugas"
      })


      pembayaran.belongsTo(models.siswa, {
        foreignKey:"nisn",
        as:"fore_nisn"
      })
    }
  };
  pembayaran.init({
    id_pembayaran: {
      type:DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    id_petugas: DataTypes.INTEGER,
    nisn: DataTypes.STRING,
    tgl_bayar: DataTypes.DATE,
    jumlah_bayar: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'pembayaran',
  });
  return pembayaran;
};