"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const truffle_connect = require("./connection.js");
const Web3 = require("web3");
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

const aws = require("aws-sdk");
const queueUrl = process.env.SQS_QUEUE_URL;
const sqs = new aws.SQS();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  let signatures = [];
  console.log(req.body);
  for (let signature of req.body) {
    const username = signature.name;
    const user_id = signature.id;
    const comment_id = signature.comment_id;
    const repo_id = signature.repoId;
    const pull_request_no = signature.pullRequestNo;
    const created_at = new Date(signature.created_at).getTime();
    const updated_at = new Date(signature.updated_at).getTime();
    signatures.push({
      username: username,
      user_id: user_id,
      comment_id: comment_id,
      repo_id: repo_id,
      pull_request_no: pull_request_no,
      created_at: created_at,
      updated_at: updated_at
    });
  }
  const params = {
    MessageBody: JSON.stringify(signatures),
    QueueUrl: queueUrl,
    DelaySeconds: 0
  };

  sqs.sendMessage(params, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});

const mnemonic = process.env.MNEMONIC;
const endpoint = process.env.ENDPOINT;
// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
truffle_connect.web3 = new Web3(new HDWalletProvider(mnemonic, endpoint));

// Export your express server so you can import it in the lambda function.
module.exports = app;
