import type { NextApiRequest, NextApiResponse } from 'next'
const csv = require('csvtojson')



const getData = async(): Promise<object> => {
    const filePath = './public/PY_List_2023.csv'
    const boatData = await csv().fromFile(filePath)
    for(let i = 0; i < boatData.length; i++){
        boatData[i].py = parseInt(boatData[i].py)
        boatData[i].crew = parseInt(boatData[i].crew)
    }
    return boatData
}

export default  async(req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const boats = await getData()
        
        if(boats){

            res.json({error: false, boats: boats});
        }
        else{
            res.json({error: true, message: 'Could not find boats'});
        }
    }
};