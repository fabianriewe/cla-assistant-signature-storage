# CLA-Assistant: Signature Storage WIP

## Overview

This project was created during the SAP Tools Hackathon 2019. By exploring the blockchain technology we were able to
create a permanent and distrubuted storage solution for digital signatures. The idea behind this, was to find a solution
which would provide a cheap and non reversible storage for a signature. Whenever a user signs a CLA in the repository, an automated process (e.g Github Action) will send the data to an endpoint, which inserts the data into a blockchain. By using the Ethereum network, data is stored world-wide, distributed and permanently. It is possible to connect the application to any other network. The API is written in node.js with express. We used the serverless framework for cost optimization. There is also the option to run the application inside a Dockerfile. We highly recommend to use it as a serverless application.

## Prerequisites

- AWS Account (when run in serverless mode)
- Ethereum Wallet (when deployed on ethereum-blockchain)
- Blockchain Access (ganache, infura, truffle develop, etc.)

## Smart Contract

The documentation of the smart contract can be found [here](./docs/index.md).
Use `npm run soldity-docgen` to regenerate the docs.

## Setup

1. In `src` create a `.env`-File (EDIT: a better solution is WIP)
2. Add the follwing variables:
   | Name | Requirement | Description |
   | --------------------- | ----------- | ----------- |
   | `MNEMONIC` | _required_ |Your crypto-wallett mnemonic or private key|
   | `ENDPOINT` | _required_ |Your blockchain endpoint|
   | `SQS_QUEUE_URL` | _optional_ |The URL of the AWS SQS Queue (only when in serverless)|
3. Run `truffle migrate` (Note: When deploying to ropsten network use `--network ropsten`)
4. In `serverless.yml` setup your AWS profile or add your credentials
5. Run `sls deploy`

## Enpoint

- GET /health -> used for healthcheks, always returns 200.
- GET /status -> the contract can be paused. Can be checked via this endpoint.
- GET /signatures -> use `signature_id` as query parameter to get a single signature
- POST /signatures -> endpoint for GitHub-Action to connect to
- GET /users -> use `user_id` as query parameter to get all signatures by a GitHub user
- GET /repos -> use `repo_id` as query parameter to get all signatures by a GitHub repository

## Architecture

![Signature Storage](./docs/architecture.png "Architecture")
