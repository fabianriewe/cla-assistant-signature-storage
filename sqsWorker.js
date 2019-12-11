// Load the AWS SDK for Node.js
const truffle_connect = require("./connection/app.js");
const Web3 = require("web3");
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

// var aws = require("aws-sdk");
// const queueUrl =
//   "https://sqs.eu-central-1.amazonaws.com/941344685665/CLA-DAPP-DEV";
// // Instantiate SQS.
// var sqs = new aws.SQS();

const mnemonic = process.env.MNEMONIC;
const ropstenEndpoint = process.env.ROPSTEN;
// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
truffle_connect.web3 = new Web3(
  new HDWalletProvider(mnemonic, ropstenEndpoint)
);

exports.handler = async (event, context, callback) => {
  console.log("event: ", JSON.stringify(event));

  for (let signature of JSON.parse(event.Records[0].body)) {
    console.log("Signature: " + signature);
    let signatureId = await truffle_connect.createSignature(
      signature.username,
      signature.user_id,
      signature.comment_id,
      signature.repo_id,
      signature.pull_request_no,
      signature.created_at,
      signature.updated_at
    );
  }

  var body = event.Records[0].body;
  console.log("text: ", JSON.parse(body).text);
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "SQS event processed.",
      input: event
    })
  };

  return response;
};