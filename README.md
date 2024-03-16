<p align="center">
  <a href="https://ublob.net/" target="blank"><img src="https://github.com/kilnfi/ublob/assets/46248870/fe8653c6-c0c4-405b-87f4-86eced4c1aed" width="200" alt="μBlob logo" /></a>
  <p align="center">Maximizing Blobspaces efficiency</p>
</p>

## TLDR;

The μBlob platform enables anyone to submit μBlobs to a public auction in order to fill DA Blobs. The goal is to propose a new innovative infrastructure to maximize blobspace efficiency and enable a thousand rollup future and democratize DA access for NFT, and gaming projects!

## An example flow

1. Project wants to use Ethereum blob as a DA, and requires only 10kb of data
2. Project sends ETH to μBlob smart contract to gain credit points (0xdfBA2a12477B8AE3Ad99C98B7D902EA63C09D247 on holesky)
3. Project creates a μBlob by submitting data, signature of the data with the credited wallet and a wei_per_gas_fee
4. An auction based on the wei_per_gas_fee is in progress until the platform can create a Blob and submit it on Ethereum DA
5. Once blob is submitted, anyone can check the composition of the submitted blob (which μBlobs, in which order are in the Blob). All the senders of the successful μBlobs credits are reduced by μBlob_size * wei_per_gas_fee. If sender does not have enough credit, its μBlob was not included in the Blob. If Blob submission fails, the Blob tx is updated until it is included by the Ethereum network.

Project contract, apis and frontend are deployed on Holesky testnet on https://ublob.net.

![screenshot-4](https://github.com/kilnfi/ublob/assets/46248870/80a57359-88a8-4b65-8d27-5b320d9ebc52)

## Blob data format detail

A Blob is made of a list of μBlobs put one after the other with the following format: ` header + μBlob data`  where:
- header is `size + signature`  where size is uint32 (4 bytes) and signature (65 bytes)
- `μBlob data`  is the content of the μBlob

## Platform screenshots

### Auction view

![screenshot-1](https://github.com/kilnfi/ublob/assets/46248870/9646cbef-db87-49ea-8195-036ad965b8a6)

### μBlob data view

![screenshot-2](https://github.com/kilnfi/ublob/assets/46248870/75e1b2dd-c9cb-418c-9a4d-ae2fea41e75a)

## Blob data view 

![screenshot-3](https://github.com/kilnfi/ublob/assets/46248870/f4d027e4-5f2a-4f25-acc1-99449eb94a9e)

## Project structure

μBlob is made of several components:

1. Golang backend made of 2 services

- exposing a REST API to handle μBlobs CRUD operations
- managing the μBlobs auction 
- crafting the Blob by merging μBlobs
- managing the Blobs submissions, or submission updates if necessary
- indexing the crediting operations made to the credit contract for accounting

2. A react ts frontend available at https://ublob.net:

- displays the current auction state, with live animations to render bidding updates and creations 
- displays the list of submitted blobs and their completion
- displays the blobs data
- displays the blobs' μBlobs with easy to use widgets

3. An orchestrator service, creating many random μBlobs to simulate activity on testnet

4. A credit Solidity smart contract, that emits Crediting event when receiving ETH and forwards the ETH value to the project address. 

## Next improvements

- [ ] Support multiple DA engine (Ethereum mainnet, Celestia, Avail etc.) and propose μBlob creators to select their DA target(s). Each DA would have its own independent μBlob auction.
- [ ] Decentralize the project by creating a network of validators performing the auctions in a permissionless manner (with shared mempool of μBlob and consensus on auction and verification of blob submissions)
- [ ] Allow crediting in ERC20.
- [ ] Deploy to mainnet.

