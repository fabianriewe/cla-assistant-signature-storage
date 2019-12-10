const Migrations = artifacts.require("Migrations");
const Signature = artifacts.require("Signature");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Signature);
};