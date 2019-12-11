const Signature = artifacts.require("Signature");
const app = require("express")();
const bodyParser = require("body-parser");

module.exports = async function() {
  app.use(bodyParser.json());
  let instance = await Signature.deployed();

  let accounts = await web3.eth.getAccounts();
  const ceoAccount = accounts[0];

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

  app.get("/repos", async (req, res) => {
    let repo_id = parseInt(req.query.repo_id);
    let signature = await instance.getSignaturesOfRepo(repo_id);
    res.json(signature);
  });

  app.post("/webhook", async (req, res) => {
    newIds = [];
    for (signature of req.body) {
      let username = signature.name;
      let user_id = signature.id;
      let comment_id = signature.comment_id;
      let repo_id = signature.repoId;
      let pull_request_no = signature.pullRequestNo;
      let created_at = new Date(signature.created_at).getTime();
      let updated_at = new Date(signature.updated_at).getTime();
      console.log("CREATING SIGNATURE FOR: " + username);
      let newId = await instance.createSignature(
        username,
        user_id,
        comment_id,
        repo_id,
        pull_request_no,
        created_at,
        updated_at,
        { from: ceoAccount }
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
