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

    // Approve/consent token transfer as user
    transaction = await realEstate.connect(seller).approve(escrow.address, 1);
    await transaction.wait()

    // list real estate
    transaction = await escrow.connect(seller).list(1,tokens(5), tokens(1),buyer.address);
    await transaction.wait()

    // deposit escrowAmount
    transaction = await escrow.connect(buyer).depositCollateral(1,{value: tokens(1)});
    await transaction.wait()

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

    describe('Listing', () => {
        it ('Update the ownership', async()=>{

            // ownerOf a ERC721 function by default coming from OZ
            // takes a param of tokenId
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)

        })
    })

    describe('Is listed?', () => {
        it ('Check if the token is listed', async()=>{
            expect(await escrow.isListed(1)).to.be.equal(true)

        })
    })

    describe('Is purchase price accurate', () => {
        it ('Check token price is expected', async() => {
            expect(await escrow.purchasePrice(1)).to.be.equal(tokens(5))
        })
    })

    describe('Is escrow price accurate', () => {
        it ('Check token price is expected', async() => {
            expect(await escrow.escrowAmount(1)).to.be.equal(tokens(1))
        })
    })

    describe('Is the deposit enough', () => {
        it ('Check if the buyer has enough deposit', async() => {
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(1))
        })
    })

    describe('Is inspector call', () =>{
        it('Check if the inspector is updating the status', async() => {
            const trx = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await trx.wait()
        })

        it('Check if the appraisal result is good', async() => {
            const trx = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await trx.wait()
            const trx2 = await escrow.getInspectionStatus(1)
            expect(trx2).to.be.equal(true)
        })
    })
})