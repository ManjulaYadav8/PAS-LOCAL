const { get, post, put } = require("request-promise")

const BaseUrl = process.env.doctype_baseurl;
const doctype = "Item"


const get_items_url = `${BaseUrl}/${doctype}`;
const create_new_item = `${BaseUrl}/${doctype}`;
const axios = require('axios');


 exports.getAllItems = async (req, res) => {
    // let bodys=req.body;
    let customparams = req.headers.params;
    // let token= req.headers.authtoken

    console.log(get_items_url);
    console.log(customparams);
    // console.log(token)
    let options = {
        method: 'get',
        url: get_items_url + customparams,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Methods": ["GET", "HEAD", "OPTIONS", "POST", "PUT"],
            "Access-Control-Allow-Headers": ["Origin", "Access-Control-Request-Method", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
            'Authorization': "token 0a051ee687fbefa:32aba57c1fb042c",
        },
       
    };

    try {
        const result = await axios(options);
        console.log(result.data);
        res.json(result.data);
    }
    catch (err) {
        console.log(err);
        res.json(err);
    }
}



exports.createNewItem = async (req, res) => {
    let body_data=req.body;
    // let customparams = req.headers.params;
    let token= req.headers.authtoken

    console.log(get_items_url);
    // console.log(customparams);
    console.log(token)
    let options = {
        method: 'post',
        url: create_new_item ,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Methods": ["GET", "HEAD", "OPTIONS", "POST", "PUT"],
            "Access-Control-Allow-Headers": ["Origin", "Access-Control-Request-Method", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
            'Authorization': token,
        },
        data:JSON.stringify(body_data)       
    };

    try {
        const result = await axios(options);
        console.log(result.data);
        res.json(result.data);
    }
    catch (err) {
        console.log(err);
        res.json(err);
    }
}
