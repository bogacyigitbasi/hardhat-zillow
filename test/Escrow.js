const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {

let buyer, seller, inspector, lender
let realEstate, escrow
beforeEach(async () => {

    const accounts = await ethers.getSigners()
    buyer = accounts[0]
    seller = accounts[1]
    inspector = accounts[2]
    lender = accounts[3]

    // console.log(accounts)
    // Deploy
    const RealEstate = await ethers.getContractFactory('RealEstate')
    realEstate = await RealEstate.deploy()

    console.log("real estate", realEstate.address)

    // Mint the real estate on the seller's behalf
    let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
    await transaction.wait()


    // deploy escrow
    const Escrow = await ethers.getContractFactory('Escrow')
    escrow = await Escrow.deploy(
        realEstate.address, seller.address, inspector.address,lender.address,{ gasLimit: 30000000 }
    )

    // Approve/consent token transfer as user
    transaction = await realEstate.connect(seller).approve(escrow.address, 1,{ gasLimit: 30000000 });
    await transaction.wait()
    console.log("byer aasda: ",buyer.address)
    // list real estate
    transaction = await escrow.connect(seller).list(1,tokens(4), tokens(1),buyer.address,{ gasLimit: 30000000 });
    await transaction.wait()

    // deposit escrowAmount
    transaction = await escrow.connect(buyer).depositCollateral(1,{value: tokens(1), gasLimit:30000000});
    await transaction.wait()

})
    describe('Deployment', () => {
        it ('Returns NFT address', async()=>{
            const result = await escrow.realEstateTokenAddress()
            // console.log(result)
            expect(result).to.be.equal(realEstate.address)
        })

        it ('Returns seller address', async()=>{
            const sell = await escrow.seller()
            // console.log(sell)
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

        it ('Check if the token is listed', async()=>{
            expect(await escrow.isListed(1)).to.be.equal(true)

        })

        it ('Returns buyer address', async()=>{
            const res = await escrow.buyer(1)
            // console.log("buyer ",buyer.address)
            expect(res).to.be.equal(buyer.address)
        })

    })

    describe('Is purchase price accurate', () => {
        it ('Check token price is expected', async() => {
            expect(await escrow.purchasePrice(1)).to.be.equal(tokens(4))
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
    describe('Sale', ()=>{
        beforeEach(async () => {
            try {
                let transaction = await escrow.connect(buyer).depositCollateral(4, { value: tokens(5) , gasLimit: 30000000 })
                await transaction.wait()

                transaction = await escrow.connect(inspector).updateInspectionStatus(1, true,{ gasLimit: 30000000 })
                await transaction.wait()

                transaction = await escrow.connect(buyer).approveSale(1,{ gasLimit: 30000000 })
                await transaction.wait()

                transaction = await escrow.connect(seller).approveSale(1,{ gasLimit: 30000000 })
                await transaction.wait()

                transaction = await escrow.connect(lender).approveSale(1,{ gasLimit: 30000000 })
                await transaction.wait()

                // const tx = {
                //     to: escrow.address,
                //     value: tokens(5),
                //     gasLimit:30000000
                //   };
                // await lender.sendTransaction(tx);

                // await lender.sendTransaction({ to: escrow.address, value: tokens(5), gasLimit: 30000000  })
                // await transaction.wait()

                transaction = await escrow.connect(seller).finalizeSale(1,{ gasLimit: 30000000 })
                await transaction.wait()

            } catch (error) {
                console.error("Error in beforeEach Hook:", error);
            }

        it('Check escrow balance', async()=>{
            expect (await escrow.getBalance()).to.be.equal(tokens(6))
            // console.log( escrow.getBalance())
            // const contractBalance = await ethers.provider.getBalance(escrow.address);
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
        })
    })
    // console.log("contract balance",escrow.getBalance())
    })
})
})