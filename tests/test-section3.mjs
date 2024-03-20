import assert from 'assert'
import supertest from 'supertest'
import { dbClean, dbClose, dbCount } from "./apiHack.mjs"
import { Section } from "../section.mjs"

var sectionConnect 
before(async () => {
    sectionConnect = await Section.load()
})

after(async () => {  
    await dbClose()

    //README: went from await sectionConnect.client.close()
    //                to await sectionConnect.close()
    await sectionConnect.close() 
})


describe('Section db methods', function() {

    var tests = [{ args: ["MATH","1000","085"], expected: 200},
                 { args: ["COMP","2408","001"], expected: 200},
                 { args: ["PHYS","2555","001"], expected: 200},
                 { args: ["GEOG","2302","051"], expected: 200},
                 { args: ["PSYC","6080","001"], expected: 200},
                 { args: ["SOCI","6399","001"], expected: 200},
                 { args: ["COMP","4444","003"], expected: 200},
                 { args: ["EASC","2031","101"], expected: 200},
                 { args: ["MATH","5151","001"], expected: 200},
                 { args: ["CRIM","4812","001"], expected: 200},
                ];

    tests.forEach(function(test){
        it(`checks add and remove methods`, async function() {
            let s = new Section()
            s.subject = test.args[0]
            s.number = test.args[1]
            s.sectionid = test.args[2]
            let query = { subject: test.args[0], number: test.args[1], sectionid: test.args[2] }
            
            let beforeCount = await dbCount(query)
            
            await s.add()
 
            let duringCount = await dbCount(query)

            await s.remove()

            let afterCount = await dbCount(query)

            await dbClean(query)
            
            assert.equal(0, beforeCount )
            assert.equal(1, duringCount)
            assert.equal(0, afterCount )
        });
    });
})

        

