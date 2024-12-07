// npx hardhat run scripts/deploy.js --network localhost

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}
async function main() {

  //setup accounts
  [buyer, seller, inspector, lender] = await ethers.getSigners();

  // deploy real estate contract
  const RealEstate = await ethers.getContractFactory('RealEstate',signer = seller)
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log("Real Estate contract deployed at", realEstate.address)
  console.log("Minting 3 properties")

  for(let i =0; i<3;i++){
    const transaction = await realEstate.connect(seller).mint('https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/"${i + 1}.json')
    await transaction.wait()
  }


  // deploy escrow
  console.log("Deploying escrow..")

  const Escrow = await ethers.getContractFactory("Escrow", signer=seller)
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  )
  await escrow.deployed()

  console.log("Escrow address ", escrow.address)


    // List recently minted real estates
  // we have real estates, we know the buyers, we have the escrow amount and min collateral
  // first token
  transaction = await escrow.connect(seller).list(1, tokens(20), tokens(10),buyer.address, { gasLimit: 30000000 })
  await transaction.wait()

  // second token
  transaction = await escrow.connect(seller).list(2, tokens(30), tokens(10),buyer.address,{ gasLimit: 30000000 })
  await transaction.wait()
  // third token
  transaction = await escrow.connect(seller).list(3, tokens(40), tokens(10), buyer.address,{ gasLimit: 30000000 })
  await transaction.wait()

  //
  console.log("Finished.")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
