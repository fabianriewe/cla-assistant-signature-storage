const Signature = artifacts.require("Signature");
const app = require("express")();
const bodyParser = require("body-parser");

module.exports = async function() {
  app.use(bodyParser.json());
  let instance = await Signature.deployed();

  app.get("/health", (req, res) => {
    res.json({ success: "true" });
  });
  app.get("/status", async (req, res) => {
    let paused = await instance.paused();
    res.json({ paused: paused });
  });

  app.get("/signatures", async (req, res) => {
    let signature_id = parseInt(req.query.signature_id);
    let signature = await instance.getSignature(signature_id);
    res.json(signature);
  });

  app.get("/users", async (req, res) => {
    let user_id = parseInt(req.query.user_id);
    let signature = await instance.getSignaturesOf(user_id);
    res.json(signature);
  });

  app.post("/webhook", async (req, res) => {
    newIds = [];
    for (signature of req.body) {
      let username = signature.name;
      let user_id = signature.id;
      let comment_id = signature.comment_id;
      let created_at = new Date(signature.created_at).getTime();
      let updated_at = new Date(signature.updated_at).getTime();
      console.log("CREATING SIGNATURE FOR: " + username);
      let newId = await instance.createSignature(
        username,
        user_id,
        comment_id,
        created_at,
        updated_at
      );
      let signatureId = parseInt(newId.logs[0].args.signatureId);
      console.log("CREATED AS ID: " + signatureId);
      console.log();
      newIds.push(signatureId);
    }
    res.json({ success: true, newIds: newIds });
  });

  app.listen(3000, () => {
    console.log("CLA API running on: 3000");
  });
};