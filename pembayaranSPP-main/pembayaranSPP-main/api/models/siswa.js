'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class siswa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.spp,{
        foreignKey: "id_spp",
        as: "spp"
      })
      // kelas
      this.belongsTo(models.kelas,{
        foreignKey: "id_kelas",
        as: "kelas"
      })
    }
  };
  siswa.init({
    nisn:{
      type:DataTypes.STRING,
      primaryKey:true,
      autoIncrement:false
    },
    password: DataTypes.STRING,
    nis: DataTypes.STRING,
    nama: DataTypes.STRING,
    id_kelas: DataTypes.INTEGER,
    alamat: DataTypes.STRING,
    no_telp: DataTypes.STRING,
    id_spp: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'siswa',
  });
  return siswa;
};