"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const app = express();
const truffle_connect = require("./connection/app.js");
const Web3 = require("web3");
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

app.get("/health", (req, res) => {
  res.json({ success: "true" });
});

app.get("/status", async (req, res) => {
  let paused = await truffle_connect.paused();
  res.json({ paused: paused });
});

app.get("/signatures", async (req, res) => {
  const signature_id = parseInt(req.query.signature_id);
  let signature = await truffle_connect.getSignature(signature_id);
  res.json(signature);
});

app.get("/users", async (req, res) => {
  let user_id = parseInt(req.query.user_id);
  let signatures = await truffle_connect.getSignaturesOfUser(user_id);
  res.json(signatures);
});

app.get("/repos", async (req, res) => {
  let repo_id = parseInt(req.query.repo_id);
  let signatures = await truffle_connect.getSignaturesOfRepo(repo_id);
  res.json(signatures);
});

app.post("/webhook", async (req, res) => {
  let newIds = [];
  for (let signature of req.body) {
    let username = signature.name;
    let user_id = signature.id;
    let comment_id = signature.comment_id;
    let repo_id = signature.repoId;
    let pull_request_no = signature.pullRequestNo;
    let created_at = new Date(signature.created_at).getTime();
    let updated_at = new Date(signature.updated_at).getTime();
    let signatureId = await truffle_connect.createSignature(
      username,
      user_id,
      comment_id,
      repo_id,
      pull_request_no,
      created_at,
      updated_at
    );
    newIds.push(signatureId);
  }
  res.json({ success: true, created: newIds });
});

const mnemonic = process.env.MNEMONIC;
const ropstenEndpoint = process.env.ROPSTEN;
// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
truffle_connect.web3 = new Web3(
  new HDWalletProvider(mnemonic, ropstenEndpoint)
);

// Export your express server so you can import it in the lambda function.
module.exports = app;
