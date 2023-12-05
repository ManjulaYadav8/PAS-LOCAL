const functions = require("firebase-functions");
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fs = require("fs");
const hb = require("handlebars");
admin.initializeApp();
require("dotenv").config();
const projectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId;
exports.sendVerification =
    functions.region("us-central1").firestore.document("User/{userDocId}")
        .onCreate((snap, ctx) => {
          const user = snap.data();
          // Referral Code
        const uid = crypto.createHash("md5").update(user.userDocId.toString(), "utf8").digest("hex");
        let referralCode = "";
        for ( let i = 0; i < 6; i++ ) {
              referralCode = referralCode + uid.charAt(Math.floor(Math.random() * uid.length));
        }
          const currenTime = new Date().getTime();
          return admin.firestore().collection("ConfigInfo").doc("config").
          get().then((doc) => {
          const configuration = doc.data();
          admin.firestore().collection("User").doc(user.userDocId).
              update({"registrationTime": currenTime , "referralCode" : referralCode , "userType" : "INDIVIDUAL" , "userSubType" : "PRIMARY"});
          const authData = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: false,
            auth: {
              user: process.env.SENDER_EMAIL,
              pass: process.env.SENDER_PASSWORD,
            },

          });
          const url = `https://us-central1-${projectId}.cloudfunctions.net/emailValidation?uid=${user.userDocId}&token=${user.token}`;
          var template = fs.readFileSync("./templates/signup.html",{encoding : "utf-8", flag : "r"});
          var hbTemplate = hb.compile(template);
          var replacements = {
            "logo" : configuration.logo,
            "name" : user.name.charAt(0).toUpperCase() + user.name.slice(1),
            "companyName" : configuration.companyName,
            "url" : url,
            "mobile" : configuration.mobile,
            "companyMail" : configuration.companyMail,
          };
          var dynamicHtml = hbTemplate(replacements);
          authData.sendMail({
            from: `${configuration.companyMail}`,
            replyTo: `${configuration.companyMail}`,
            to: `${user.email}`,
            subject: `Verify your e-mail for ${configuration.companyName}`,
            html: `${dynamicHtml}`,
          }).then((res) => {
            console.log("Successfully sent that mail");
            return null;
          }).catch((err) => {
            console.log(err);
          });
        });
      });
exports.emailValidation =
  functions.region("us-central1").https.onRequest((req, res)=>{
    admin.firestore().collection("User").doc(req.query.uid).
        get().then((doc) => {
          const data = doc.data();
          const signuptime = data.registrationTime;
          const currenTime = new Date().getTime();
          const diffTime =
              ((parseInt(currenTime) - parseInt(signuptime))/60000);
          console.log(diffTime);
          return admin.firestore().collection("ConfigInfo").doc("config").
          get().then((doc) => {
          const configuration = doc.data();
          var replacements = {
            "logo" : configuration.logo,
            "name" : data.name.charAt(0).toUpperCase() + data.name.slice(1),
            "userId": data.userDocId,
            "resendLink" : `https://us-central1-${projectId}.cloudfunctions.net/resendMail?uid=${data.userDocId}`,
            "companyName" : configuration.companyName,
            "website" : configuration.website,
            "mobile" : configuration.mobile,
            "companyMail" : configuration.companyMail,
          };
          if (data.token == req.query.token) {
            if (parseInt(diffTime) <= 30) {
              let template = fs.readFileSync("./templates/verified.html",{encoding : "utf-8", flag : "r"});
              let hbTemplate = hb.compile(template);
              let dynamicHtml = hbTemplate(replacements);
              admin.firestore().collection("User").doc(data.userDocId).
                  update({"emailVerified": true});
              res.send(dynamicHtml);
            } else {
              let template = fs.readFileSync("./templates/linkExpire.html",{encoding : "utf-8", flag : "r"});
              let hbTemplate = hb.compile(template);
              let dynamicHtml = hbTemplate(replacements);
              res.send(dynamicHtml);
            }
          } else {
              let template = fs.readFileSync("./templates/invalidLink.html",{encoding : "utf-8", flag : "r"});
              let hbTemplate = hb.compile(template);
              let dynamicHtml = hbTemplate(replacements);
            res.send(dynamicHtml);
          }
        });
      });
  });
exports.resendMail =
  functions.region("us-central1").https.onRequest((req, res)=>{
    admin.firestore().collection("User").doc(req.query.uid).
        get().then((doc) => {
          const user = doc.data();
          const currenTime = new Date().getTime();
          const a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIOPQRSTUVWXYZ1234567890"
              .split("");
          const b = [];
          for (let i=0; i<20; i++) {
            const j = (Math.random() * (a.length-1)).toFixed(0);
            b[i] = a[j];
          }
          const linktoken = b.join("");
          const tokenUid = linktoken.concat(user.userDocId);
          console.log(tokenUid);
          return admin.firestore().collection("ConfigInfo").doc("config").
          get().then((doc) => {
          const configuration = doc.data();
          var replacements = {
            "logo" : configuration.logo,
            "name" : user.name.charAt(0).toUpperCase() + user.name.slice(1),
            "userId": user.userDocId,
            "companyName" : configuration.companyName,
            "url" : `https://us-central1-${projectId}.cloudfunctions.net/emailValidation?uid=${user.userDocId}&token=${tokenUid}`,
            "website" : configuration.website,
            "mobile" : configuration.mobile,
            "companyMail" : configuration.companyMail,
          };
          var template = fs.readFileSync("./templates/resend.html",{encoding : "utf-8", flag : "r"});
          var hbTemplate = hb.compile(template);
          var dynamicHtml = hbTemplate(replacements);
          admin.firestore().collection("User").doc(user.userDocId).
              update({"token": tokenUid, "registrationTime": currenTime});
          res.send(dynamicHtml);
          const authData = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: false,
            auth: {
              user: process.env.SENDER_EMAIL,
              pass: process.env.SENDER_PASSWORD,
            },
          });
          var restemplate = fs.readFileSync("./templates/signup.html",{encoding : "utf-8", flag : "r"});
          var reshbTemplate = hb.compile(restemplate);
          var resDynamicHtml = reshbTemplate(replacements);
          authData.sendMail({
            from: `${configuration.companyMail}`,
            replyTo: `${configuration.companyMail}`,
            to: `${user.email}`,
            subject: `Verify your e-mail for ${configuration.companyName}`,
            html:  resDynamicHtml,
          }).then((res) => {
            console.log("Successfully sent that mail");
            return null;
          }).catch((err) => {
            console.log(err);
          });
        });
      });
  });
  exports.sendEmailNotification =
  functions.region("us-central1").firestore.document("Order/{orderDocId}")
      .onCreate((snap, ctx) => {
        const data = snap.data();
        const temp = data.pdf;
        const db = admin.firestore();
        return db.collection("ConfigInfo").doc("config").
        get().then((doc) => {
      const configuration = doc.data();
      const authData = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: false,
        auth: {
          user: process.env.SENDER_EMAIL,
          pass: process.env.SENDER_PASSWORD,
        },
      });
      var orderItems = [];
      for (let i=0; i<data.orderItems.length; i++) {
        orderItems.push({
         "productName" : data.orderItems[i].productName ,
         "quantity" : data.orderItems[i].quantity ,
         "productPrice" : parseFloat(data.orderItems[i].productPrice).toFixed(2) ,
         "currencySymbol" : configuration.currencySymbol,
         "productWeight" : data.orderItems[i].productWeight != undefined && data.orderItems[i].productWeight != null ? data.orderItems[i].productWeight : '',
         "productWeightUom" : data.orderItems[i].productWeightUom != undefined && data.orderItems[i].productWeightUom != null ? data.orderItems[i].productWeightUom : '',
         "productSize" : data.orderItems[i].productSize != undefined && data.orderItems[i].productSize != null ? data.orderItems[i].productSize : '',
         "productSizeUom" : data.orderItems[i].productSizeUom != undefined && data.orderItems[i].productSizeUom != null ? data.orderItems[i].productSizeUom : '',
         "productColor" : data.orderItems[i].productColor != undefined && data.orderItems[i].productColor != null ? data.orderItems[i].productColor : '',
         "itemCount" : data.orderItems[i].itemCount != undefined && data.orderItems[i].itemCount != null ? data.orderItems[i].itemCount : '',
        });
      }
      function getCustomFormatDate(date){
        return new Date(date).getDate()+"-"+new Date(date).toLocaleString('en-US', { month: 'short'})+"-"+new Date(date).getFullYear();
      }
      hb.registerHelper('check', function(value) {
        return (value != undefined && value != null && value != '') ? value : '';
      });
      // hb.registerHelper('checkwithuom', function(value,uom,factor) {
      //   return (value != undefined && value != null && value != '' &&
      //              uom != undefined && uom != null && uom != '') ? new hb.SafeString('<b>'+factor+'</b>'+' : '+value+" "+uom+"<br/>") : '';
      // });
      // hb.registerHelper('check', function(value,factor) {
      //   return (value != undefined && value != null && value != '') ? new hb.SafeString('<b>'+factor+'</b>'+' : '+value+"<br/>") : '';
      // });
      const couponDiscountShow = data.couponDiscount === 0.00 ? false : true;
      const oneTaxSystemShow = !(configuration.country === "INDIA" && data.tax !== 0.00) ? false : true;
      const federalTaxAmtShow = !(configuration.country !== "INDIA" && data.variousTax.federalTaxAmt !== 0.00) ? false : true;
      const stateTaxAmtShow = !(configuration.country !== "INDIA" && data.variousTax.stateTaxAmt !== 0.00) ? false : true;
      const salesTaxAmtShow = !(configuration.country !== "INDIA" && data.variousTax.salesTaxAmt !== 0.00) ? false : true;
      const vatShow = !(configuration.country !== "INDIA" && data.variousTax.vat !== 0.00) ? false : true;
      var orderSts = data.orderStatusName === "InProgress" ? "In Progress" : data.orderStatusName;
      var template = fs.readFileSync("./templates/order.html",{encoding : "utf-8", flag : "r"});
          var hbTemplate = hb.compile(template);
          var replacements = {
            "heading" : "Your order has been Placed Successfully",
            "subHeading" : `We have received your order #${data.orderId}`,
            "logo" : configuration.logo,
            "name" : data.fullName.charAt(0).toUpperCase() + data.fullName.slice(1),
            "companyName" : configuration.companyName,
            "companyMobile" : configuration.mobile,
            "companyMail" : configuration.companyMail,
            "currencySymbol" : configuration.currencySymbol,
            // Order Infomation
            "orderId" : data.orderId,
            "orderReqDate" : getCustomFormatDate(data.orderReqDate),
            "orderStatusName" : orderSts,
            "paymentMode" : data.paymentMode,
            "pdfUrl" : data.pdf,
            "mode" : data.mode,
            "estimatedDeliveryDate" : getCustomFormatDate(data.estimatedDeliveryDate),
            "orderItems" : orderItems, // array of Items
            // Billing Address
            "fullName" : data.fullName,
            "addressLine1" : data.addressLine1,
            "addressLine2" : data.addressLine2,
            "city" : data.city,
            "state" : data.state,
            "pincode" : data.pincode,
            "mobile" : data.mobile,
            "email" : data.email,
            // Tax Information
            "subtotal" : parseFloat(data.subtotal).toFixed(2),
            "shippingCharges" : parseFloat(data.shippingCharges).toFixed(2),
            "tax" : parseFloat(data.tax).toFixed(2),
            "federalTaxAmt" : parseFloat(data.variousTax.federalTaxAmt).toFixed(2),
            "stateTaxAmt" : parseFloat(data.variousTax.stateTaxAmt).toFixed(2),
            "salesTaxAmt" : parseFloat(data.variousTax.salesTaxAmt).toFixed(2),
            "vat" : parseFloat(data.variousTax.vat).toFixed(2),
            "couponDiscount" : parseFloat(data.couponDiscount).toFixed(2),
            "total" : parseFloat(data.total).toFixed(2),
            // Tax Visibility
            "couponDiscountShow" : couponDiscountShow,
            "oneTaxSystemShow" : oneTaxSystemShow,
            "federalTaxAmtShow" : federalTaxAmtShow,
            "stateTaxAmtShow" : stateTaxAmtShow,
            "salesTaxAmtShow" : salesTaxAmtShow,
            "vatShow" : vatShow,
          };
          var dynamicHtml = hbTemplate(replacements);

      authData.sendMail({
        from: `${configuration.companyMail}`,
        to: `${data.email}`,
        cc: `${configuration.companyMail}`,
        subject: `Order placed successFully with OrderId #${data.orderId}`,
        html: dynamicHtml,
        attachments: [{
          filename: "invoice.pdf",
          path: `${temp}`,
          contentType: "application/pdf",
        }],
      }).then((res) => {
        console.log("Successfully sent that mail");
        return null;
      }).catch((err) => {
        console.log(err);
      });
      // Admin Email
      authData.sendMail({
        from: `${configuration.companyMail}`,
        to: `${configuration.companyMail}`,
        subject: `Order placed successFully with OrderId #${data.orderId}`,
        html: dynamicHtml,
        attachments: [{
          filename: "invoice.pdf",
          path: `${temp}`,
          contentType: "application/pdf",
        }],
      }).then((res) => {
        console.log("Successfully sent that mail");
        return null;
      }).catch((err) => {
        console.log(err);
      });
      });
    });
exports.sendOrderStatusEmail =
  functions.region("us-central1").firestore.document("Order/{orderDocId}")
      .onUpdate((change, context) => {
        const after = change.after.data();
        const before = change.before.data();
        const db = admin.firestore();
        return db.collection("ConfigInfo").doc("config").
          get().then((doc) => {
        const configuration = doc.data();
        const authData = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: false,
          auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD,
          },
      });
        db.collection("Order").doc(context.params.orderDocId)
            .get()
            .then((doc) => {
              const order = doc.data();
              var orderItems = [];
              for (let i=0; i<order.orderItems.length; i++) {
                orderItems.push({
                 "productName" : order.orderItems[i].productName ,
                 "quantity" : order.orderItems[i].quantity ,
                 "productPrice" : parseFloat(order.orderItems[i].productPrice).toFixed(2) ,
                 "currencySymbol" : configuration.currencySymbol,
                 "productWeight" : order.orderItems[i].productWeight != undefined && order.orderItems[i].productWeight != null ? order.orderItems[i].productWeight : '',
                 "productWeightUom" : order.orderItems[i].productWeightUom != undefined && order.orderItems[i].productWeightUom != null ? order.orderItems[i].productWeightUom : '',
                 "productSize" : order.orderItems[i].productSize != undefined && order.orderItems[i].productSize != null ? order.orderItems[i].productSize : '',
                 "productSizeUom" : order.orderItems[i].productSizeUom != undefined && order.orderItems[i].productSizeUom != null ? order.orderItems[i].productSizeUom : '',
                 "productColor" : order.orderItems[i].productColor != undefined && order.orderItems[i].productColor != null ? order.orderItems[i].productColor : '',
                 "itemCount" : order.orderItems[i].itemCount != undefined && order.orderItems[i].itemCount != null ? order.orderItems[i].itemCount : '',
                });
              }
              function getCustomFormatDate(date){
                return new Date(date).getDate()+"-"+new Date(date).toLocaleString('en-US', { month: 'short'})+"-"+new Date(date).getFullYear();
              }
              hb.registerHelper('check', function(value) {
                return (value != undefined && value != null && value != '') ? value : '';
              });
              const couponDiscountShow = order.couponDiscount === 0.00 ? false : true;
              const oneTaxSystemShow = !(configuration.country === "INDIA" && order.tax !== 0.00) ? false : true;
              const federalTaxAmtShow = !(configuration.country !== "INDIA" && order.variousTax.federalTaxAmt !== 0.00) ? false : true;
              const stateTaxAmtShow = !(configuration.country !== "INDIA" && order.variousTax.stateTaxAmt !== 0.00) ? false : true;
              const salesTaxAmtShow = !(configuration.country !== "INDIA" && order.variousTax.salesTaxAmt !== 0.00) ? false : true;
              const vatShow = !(configuration.country !== "INDIA" && order.variousTax.vat !== 0.00) ? false : true;

              var template = fs.readFileSync("./templates/order.html",{encoding : "utf-8", flag : "r"});
                  var hbTemplate = hb.compile(template);
                  var heading = '';
                  var orderSts = order.orderStatusName === "InProgress" ? "In Progress" : order.orderStatusName;
                  if (after.orderStatusName === before.orderStatusName) {
                    heading = `Your order #${order.orderId} estimated delivery date updated to ${getCustomFormatDate(order.estimatedDeliveryDate)} `;
                  } else {
                    heading = `Your order #${order.orderId} has been updated to ${orderSts}`;
                  }
                  var replacements = {
                    "heading" : heading,
                    "subHeading" : '',
                    "logo" : configuration.logo,
                    "name" : order.fullName.charAt(0).toUpperCase() + order.fullName.slice(1),
                    "companyName" : configuration.companyName,
                    "companyMobile" : configuration.mobile,
                    "companyMail" : configuration.companyMail,
                    "currencySymbol" : configuration.currencySymbol,
                    // Order Infomation
                    "orderId" : order.orderId,
                    "orderReqDate" : getCustomFormatDate(order.orderReqDate),
                    "orderStatusName" : orderSts,
                    "paymentMode" : order.paymentMode,
                    "pdfUrl" : order.pdf,
                    "mode" : order.mode,
                    "estimatedDeliveryDate" : getCustomFormatDate(order.estimatedDeliveryDate),
                    "orderItems" : orderItems, // array of Items
                    // Billing Address
                    "fullName" : order.fullName,
                    "addressLine1" : order.addressLine1,
                    "addressLine2" : order.addressLine2,
                    "city" : order.city,
                    "state" : order.state,
                    "pincode" : order.pincode,
                    "mobile" : order.mobile,
                    "email" : order.email,
                    // Tax Information
                    "subtotal" : parseFloat(order.subtotal).toFixed(2),
                    "shippingCharges" : parseFloat(order.shippingCharges).toFixed(2),
                    "tax" : parseFloat(order.tax).toFixed(2),
                    "federalTaxAmt" : parseFloat(order.variousTax.federalTaxAmt).toFixed(2),
                    "stateTaxAmt" : parseFloat(order.variousTax.stateTaxAmt).toFixed(2),
                    "salesTaxAmt" : parseFloat(order.variousTax.salesTaxAmt).toFixed(2),
                    "vat" : parseFloat(order.variousTax.vat).toFixed(2),
                    "couponDiscount" : parseFloat(order.couponDiscount).toFixed(2),
                    "total" : parseFloat(order.total).toFixed(2),
                    // Tax Visibility
                    "couponDiscountShow" : couponDiscountShow,
                    "oneTaxSystemShow" : oneTaxSystemShow,
                    "federalTaxAmtShow" : federalTaxAmtShow,
                    "stateTaxAmtShow" : stateTaxAmtShow,
                    "salesTaxAmtShow" : salesTaxAmtShow,
                    "vatShow" : vatShow,
                  };
                  var dynamicHtml = hbTemplate(replacements);

              authData.sendMail({
                from: `${configuration.companyMail}`,
                replyTo: `${configuration.companyMail}`,
                to: `${order.email}`,
                cc: `${configuration.companyMail}`,
                subject: heading,
                html: dynamicHtml,
              }).then((res) => {
                console.log("Successfully sent that mail");
                return null;
              }).catch((err) => {
                console.log(err);
              });
            });
          });
      });
exports.inventoryStatus =
  functions.region("us-central1").firestore
      .document("ProductManagement/Product/ProductList/{productDocId}")
      .onUpdate((change, context) => {
        const db = admin.firestore();
        return db.collection("ConfigInfo").doc("config").
          get().then((doc) => {
        const configuration = doc.data();
        const after = change.after.data();
        const authData = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: false,
          auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD,
          },
        });
        if (after.currentStock <= after.minThresholdQty) {
          var template = fs.readFileSync("./templates/inventory.html",{encoding : "utf-8", flag : "r"});
          var hbTemplate = hb.compile(template);
          var replacements = {
            "logo" : configuration.logo,
            "companyName" : configuration.companyName,
            "mobile" : configuration.mobile,
            "companyMail" : configuration.companyMail,
            "productName" : after.productName,
            "currentStock" : after.currentStock,
          };
          var dynamicHtml = hbTemplate(replacements);
          authData.sendMail({
            from: `${configuration.companyMail}`,
            replyTo: `${configuration.companyMail}`,
            to: `${configuration.companyMail}`,
            cc: `${configuration.companyMail}`,
            subject: `${after.productName} - Product Quantity is Low`,
            html: dynamicHtml,
          }).then((res) => {
            console.log("Successfully sent that mail");
            return null;
          }).catch((err) => {
            console.log(err);
          });
          }
        });
      });
exports.ContactNotification =
  functions.region("us-central1").firestore
      .document("Contact/{contactDocId}")
      .onCreate((snap, ctx) => {
        const data = snap.data();
        const db = admin.firestore();
        return db.collection("ConfigInfo").doc("config").
          get().then((doc) => {
        const configuration = doc.data();
        const authData = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: false,
          auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD,
          },
        });
        var template = fs.readFileSync("./templates/contact.html",{encoding : "utf-8", flag : "r"});
        var hbTemplate = hb.compile(template);
        var replacements = {
          "logo" : configuration.logo,
          "fullName" : data.fullName.charAt(0).toUpperCase() + data.fullName.slice(1),
          "phone" : data.phone,
          "message" : data.message,
          "companyName" : configuration.companyName,
          "mobile" : configuration.mobile,
          "companyMail" : configuration.companyMail,
        };
        var dynamicHtml = hbTemplate(replacements);
        console.log(data.email);
        authData.sendMail({
          from: `${configuration.companyMail}`,
          to: `${data.email}`,
          subject: `${data.subject}`,
          html: dynamicHtml,
        }).then((res) => {
          console.log("Successfully sent that mail");
          var adminTemplate = fs.readFileSync("./templates/contactAdmin.html",{encoding : "utf-8", flag : "r"});
          var adminHbTemplate = hb.compile(adminTemplate);
          var adminReplace = {
            "logo" : configuration.logo,
            "fullName" : data.fullName.charAt(0).toUpperCase() + data.fullName.slice(1),
            "email" : data.email,
            "phone" : data.phone,
            "message" : data.message,
            "companyName" : configuration.companyName,
            "mobile" : configuration.mobile,
            "companyMail" : configuration.companyMail,
          };
          var adminDynamicHtml = adminHbTemplate(adminReplace);
          authData.sendMail({
            from: `${configuration.companyMail}`,
              to: `${configuration.companyMail}`,
              subject: `${data.subject}`,
              html: adminDynamicHtml,
          }).then((res) => console.log("Successfully sent that mail"))
          .catch((err) => {
              console.log(err);
          });
        }).catch((err) => {
          console.log(err);
      });
    });
  });
exports.EventNotification =
  functions.region("us-central1").firestore
      .document("AppointmentManagements/{appointmentDocId}")
      .onCreate((snap, ctx) => {
        const data = snap.data();
        const db = admin.firestore();
        return db.collection("ConfigInfo").doc("config").
          get().then((doc) => {
        const configuration = doc.data();
        const authData = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: false,
          auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD,
          },
        });
        function getCustomFormatDate(date){
          return new Date(date).getDate()+"-"+new Date(date).toLocaleString('en-US', { month: 'short'})+"-"+new Date(date).getFullYear();
        }
        var template = fs.readFileSync("./templates/event.html",{encoding : "utf-8", flag : "r"});
        var hbTemplate = hb.compile(template);
        var replacements = {
          // company info
          "logo" : configuration.logo,
          "companyName" : configuration.companyName,
          "companyMobile" : configuration.mobile,
          "companyMail" : configuration.companyMail,
          "sendUser" : true,
          // event info
          "eventType" : data.eventType,
          "eventDate" : getCustomFormatDate(data.eventDate),
          "eventTime" : data.eventTime,
          // "noOfSlots" : data.noOfSlots,
          // person info
          "fullName" : data.fullName.charAt(0).toUpperCase() + data.fullName.slice(1),
          "mobile" : data.mobile,
          "email" : data.email,
        };
        var dynamicHtml = hbTemplate(replacements);
        authData.sendMail({
          from: `${configuration.companyMail}`,
          to: `${data.email}`,
          subject: `Booking Details for ${data.eventType} Event`,
          html: dynamicHtml,
          }).then((res) => {
            console.log("Successfully sent that mail");
            replacements["sendUser"] = false;
            dynamicHtml = hbTemplate(replacements);
            authData.sendMail({
                from: `${configuration.companyMail}`,
                to: `${configuration.companyMail}`,
                subject: `Catering Service for ${data.eventType} event`,
                html: dynamicHtml,
            }).then((res) => console.log("Successfully sent that mail"))
            .catch((err) => {
                console.log(err);
            });
          })
          .catch((err) => {
              console.log(err);
          });
        });
      });
exports.userInsert =
  functions.region("us-central1").firestore
      .document("User/{userDocId}")
      .onCreate((snap,ctx) => {
        const user = snap.data();
        admin.database().ref(`Metadata/User/${ctx.params.userDocId}`).set(user).then((res) => {
          console.log("User Got Created.");
        }).catch((err) => {
          console.log(err);
        });
      });
exports.userUpdate =
  functions.region("us-central1").firestore
      .document("User/{userDocId}")
      .onUpdate((snap,ctx) => {
        const user = snap.after.data();
        admin.database().ref(`Metadata/User/${ctx.params.userDocId}`).update(user).then((res) => {
          console.log("User Got Updated.");
        }).catch((err) => {
          console.log(err);
        });
      });
exports.productInsert =
  functions.region("us-central1").firestore
      .document("ProductManagement/{catalogType}/{catalogTypeCollection}/{catalogTypeDoc}")
      .onCreate((snap,ctx) => {
        const catalogData = snap.data();
        const catalogType = ctx.params.catalogType;
        const catalogTypeCollection = ctx.params.catalogTypeCollection;
        const catalogTypeDoc = ctx.params.catalogTypeDoc;
        admin.database().ref(`Metadata/Product/${catalogType}/${catalogTypeCollection}/${catalogTypeDoc}`).set(catalogData).then((res) => {
            console.log("Product Got Created.");
        }).catch((err) => {
          console.log(err);
        });
      });
exports.productUpdate =
  functions.region("us-central1").firestore
      .document("ProductManagement/{catalogType}/{catalogTypeCollection}/{catalogTypeDoc}")
      .onUpdate((snap,ctx) => {
        const catalogData = snap.after.data();
        const catalogType = ctx.params.catalogType;
        const catalogTypeCollection = ctx.params.catalogTypeCollection;
        const catalogTypeDoc = ctx.params.catalogTypeDoc;
        admin.database().ref(`Metadata/Product/${catalogType}/${catalogTypeCollection}/${catalogTypeDoc}`).update(catalogData).then((res) => {
          console.log("Product Got Updated!");
        }).catch((err) => {
          console.log(err);
        });
      });
exports.orderInsert =
  functions.region("us-central1").firestore
      .document("Order/{orderId}")
      .onCreate((snap,ctx) => {
        const order = snap.data();
        admin.database().ref(`Metadata/Order/${ctx.params.orderId}`).set(order).then((res) => {
          console.log("Order Got Created.");
        }).catch((err) => {
          console.log(err);
        });
      });
exports.orderUpdate =
  functions.region("us-central1").firestore
      .document("Order/{orderId}")
      .onUpdate((snap,ctx) => {
        const order = snap.after.data();
        admin.database().ref(`Metadata/Order/${ctx.params.orderId}`).update(order).then((res) => {
          console.log("Order Got Updated.");
        }).catch((err) => {
          console.log(err);
        });
      });
