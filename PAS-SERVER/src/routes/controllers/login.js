const BaseUrl = process.env.baseurl;
const login_url = `${BaseUrl}/api/method/library_management.signin.login`;
// const login_url ="https://web.lnder.in/api/method/lnder_app.www.test_01.integration.signin.login"

const axios = require('axios');
const { get, post, put } = require("request-promise")

exports.getLoginDetails = async (req, res) => {
    let bodys=req.body;
    console.log(req.body)
    console.log(login_url);
    let options = {
        method: 'post',
        url: login_url,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Methods": ["GET", "HEAD", "OPTIONS", "POST", "PUT"],
            "Access-Control-Allow-Headers": ["Origin", "Access-Control-Request-Method", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
        },
        data: req.body
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

    // res.send({"status":"Login sucessfully"});
}