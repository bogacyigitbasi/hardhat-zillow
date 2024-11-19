const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
let buyer, seller, inspector, lender
let realEstate, escrow
beforeEach(async () => {

    const accounts = await ethers.getSigners()
    const buyer = accounts[0]
    seller = accounts[1]
    inspector = accounts[2]
    lender = accounts[3]

    // console.log(accounts)
    // Deploy
    const RealEstate = await ethers.getContractFactory('RealEstate')
    realEstate = await RealEstate.deploy()

    console.log(realEstate.address)

    // Mint the real estate on the seller's behalf
    let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
    await transaction.wait()


    // deploy escrow
    const Escrow = await ethers.getContractFactory('Escrow')
    escrow = await Escrow.deploy(
        realEstate.address, seller.address, inspector.address,lender.address
    )
})
    describe('Deployment', () => {
        it ('Returns NFT address', async()=>{
            const result = await escrow.realEstateTokenAddress()
            console.log(result)
            expect(result).to.be.equal(realEstate.address)

        })

        it ('Returns seller address', async()=>{
            const sell = await escrow.seller()
            console.log(sell)
            console.log(seller.address)
            expect(sell).to.be.equal(seller.address)
        })

        it ('Returns inspector', async() => {
            const ins = await escrow.inspector()
            console.log(ins)
            console.log(inspector.address)
            expect(ins).to.be.equal(inspector.address)
        })
})
