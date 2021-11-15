   // initialization

   var express = require("express");
   var bodyParser = require("body-parser");
   var request = require("request");
   var nodemailer = require('nodemailer');
   var fb = require("firebase");
   const path = require("path");
   var alert = require('alert');
   var app = express();


   app.use(bodyParser.json());

   app.use(bodyParser.urlencoded({
       extended: true
   }));

   app.use('/js', express.static(__dirname + 'node_modules/jquery/dist'));
   var name = 'jade';

   //Helps to apply css to Html page
   app.use(express.static("public"));

   app.set('view engine', 'ejs'); //render HTML files

   app.engine('html', require('ejs').renderFile); //set engine


   //Get's the HTML PAGE

   app.get("/", function(req, res) {

       res.sendFile(__dirname + "/signin.html");

   });

   //initialize Firebase

   var appIni = fb.initializeApp({


       apiKey: "AIzaSyD4mWm5k6N0Q9JCOeKUZCp7-Az0L30iWUE",
       authDomain: "cartrabbit-d649c.firebaseapp.com",
       databaseURL: "https://cartrabbit-d649c-default-rtdb.firebaseio.com",
       projectId: "cartrabbit-d649c",
       storageBucket: "cartrabbit-d649c.appspot.com",
       messagingSenderId: "563067577201",
       appId: "1:563067577201:web:c476ade6a6f7a98d138cd0",
       measurementId: "G-TX64810FE4"

   });


   fb.auth.Auth.Persistence.LOCAL; //Firebase auth function for signin signout

   //post function for Login  route

   app.post("/login", function(req, res) {


       var email = req.body.email;
       var password = req.body.password;
       console.log(email, password)

       if (email != "" && password != "") {
           var result = fb.auth().signInWithEmailAndPassword(email, password); //login user with email and password from user
           result.catch(function(error) {

               var errorCode = error.code;
               var errorMessage = error.message;
               console.log(errorCode);
               console.log(errorMessage);

               alert("Message :" + errorMessage);

           });
       } else {

           alert("Please Fill Out the Fields");

       }
       fb.auth().onAuthStateChanged(function(user) // checks the user ACtivity
           {


               if (email == "jstuwart1820@gmail.com") {
                   res.sendFile(__dirname + "/ownerPage.html");
               } else {
                   res.sendFile(__dirname + "/home.html")
               }

           });

   });

   //post function for register  route

   app.post("/register", function(req, res) {


       var email = req.body.email;
       var password = req.body.password;
       var cpassword = req.body.cpassword;

       console.log(email, password, cpassword)

       if (email != "" && password != "") {
           if (password == cpassword) {
               var result = fb.auth().createUserWithEmailAndPassword(email, password); //create user with email and password from user

               result.catch(function(error) {

                   var errorCode = error.code;
                   var errorMessage = error.message;

                   console.log(errorCode);
                   console.log(errorMessage);

                   alert("Message :" + errorMessage);


               });
           }
       } else { alert("Please Fill Out the Fields"); }

       fb.auth().onAuthStateChanged(function(user) //checks there is an change in user activity
           {

               if (user) {
                   var userID = fb.auth().currentUser.uid; //get current user uid

                   fb.database().ref('Users/' + userID).once('value').then(function(snapshot) //get values from database
                       {

                           if (snapshot.val()) {
                               res.sendFile(__dirname + "/home.html");
                           } else {
                               res.sendFile(__dirname + "/accountDetails.html");

                           }

                       });
               }

           });
   });
   //post function for forgotAccvalue

   app.post("/forgotAccValue", function(req, res) {


       var email = req.body.email;

       console.log(email)

       if (email != "") {

           fb.auth().sendPasswordResetEmail(email).then(function() //password reset mail from Google firebase application
               {

                   alert("email sent ");
               })

           .catch(function(error) {

               var errorCode = error.code;
               var errorMessage = error.message;

               console.log(errorCode);
               console.log(errorMessage);

               alert("Message :" + errorMessage);


           });
       } else { alert("Please Fill Out the Fields"); }
   });


   //accountSubmit post function

   app.post("/accountSubmit", function(req, res) {

       //variables to get values from html form

       var name = req.body.name;
       var phoneNo = req.body.phoneNo;
       var address = req.body.address;

       console.log(name, phoneNo, address)

       //Access to firebase database

       var rootRef = fb.database().ref().child("Users");
       var userID = fb.auth().currentUser.uid;
       var usersRef = rootRef.child(userID);
       console.log("userid" + userID)

       if (name != "" && phoneNo != "" && address != "") {

           //setdata to the firebase Realtiime database

           var userdata = {
               "name": name,
               "phoneNo": phoneNo,
               "address": address

           }

           usersRef.set(userdata, function(error) {
               if (error) {


                   var errorCode = error.code;
                   var errorMessage = error.message;

                   console.log(errorCode);
                   console.log(errorMessage);

                   alert("Message :" + errorMessage);


               } else {
                   fb.auth().onAuthStateChanged(function(user) {

                       if (user) {

                           fb.database().ref('Users/' + userID).once('value').then(function(snapshot) {

                               if (snapshot.val()) {
                                   res.sendFile(__dirname + "/home.html");
                               }

                           });
                       }

                   });
               }


           });
       } else {
           alert("Please Fill Out the Fields");
       }
   });

   //post function for bookingDetails

   app.post("/bookingDetails", function(req, res) {

       //values from html form

       var bookingDate = req.body.bookingDate;
       var vehicleName = req.body.vehicleName;
       var vehicleNo = req.body.vehicleNo;
       var bookingTime = req.body.bookingTime;
       var bookingStatus = "pending";
       var serviceType = req.body.service;
       var bookedBy = req.body.name;

       console.log(bookingDate, bookingTime, vehicleName, vehicleNo, serviceType);

       //Access to firebase node

       var rootRef = fb.database().ref().child("BookingDetails");
       var rootRefPending = fb.database().ref().child("pendingDetails");
       var userID = fb.auth().currentUser.uid;
       var usersRef = rootRef.child(userID + "/currentBooking");
       var usersRefPending = rootRefPending.child(bookedBy);

       if (bookingTime != "" && bookingDate != "" && vehicleNo != "" && vehicleName != "" && bookedBy != "") {

           //setdata to firebasse

           var userdata = {
               "vehicleName": vehicleName,
               "vehicleNo": vehicleNo,
               "bookingDate": bookingDate,
               "bookingTime": bookingTime,
               "bookingStatus": bookingStatus,
               "serviceType": serviceType,
               "bookedBy": bookedBy

           }
           usersRefPending.set(userdata, function(error) {
               if (error) {


                   var errorCode = error.code;
                   var errorMessage = error.message;

                   console.log(errorCode);
                   console.log(errorMessage);

                   alert("Message :" + errorMessage);


               }
           })
           usersRef.set(userdata, function(error) {
               if (error) {


                   var errorCode = error.code;
                   var errorMessage = error.message;

                   console.log(errorCode);
                   console.log(errorMessage);

                   alert("Message :" + errorMessage);


               } else {
                   alert("Successfully Booked, Please drop your vehicle at booked time, THANK YOU !!!")

               }


           });
       }

       // NODEMAILER Sends mail to the owner

       if (bookingStatus == "pennding") {
           var transporter = nodemailer.createTransport({

               service: 'gmail',
               auth: {
                   user: 'johnbiker@gmail.com',
                   pass: 'johnservice007'

               }

           });

           var mailOptions = {
               from: "jstuwart@gmail.com",
               to: 'johnbiker@gmail.com',
               subject: 'bike service has been booked',
               text: 'time of booking' + bookingDate

           };

           transporter.sendMail(mailOptions, function(error, info) {

               if (error) {
                   console.log(error);
               } else {

                   console.log('Email sent: ' + info.response);

               }

           });

       } else {
           alert("Please Fill Out the Fields");
       }
   });



   app.post("/customerDetails", function(req, res) {

       fb.auth().onAuthStateChanged(function(user) {

           var userID = fb.auth().currentUser.uid;

           fb.database().ref('BookingDetails/' + userID + "/currentBooking").once('value').then(function(snapshot) {
               var x = snapshot.val();

               console.log(x)
               if (snapshot.val()) {

                   res.render(__dirname + "/customerDetails.html", {
                       bookedBy: x.bookedBy,
                       bookingDate: x.bookingDate,
                       bookingStatus: x.bookingStatus,
                       vehicleName: x.vehicleName,
                       bookingTime: x.bookingTime,
                       vehicleNo: x.vehicleNo,
                       serviceType: x.serviceType
                   });
               } else {
                   alert("Currently there is no booking made by you ...")
               }

           });
       });
   });



   app.post("/previousDetails", function(req, res) {


       var userID = fb.auth().currentUser.uid;

       fb.database().ref('BookingDetails/' + userID + "/previousBooking").once('value').then(function(snapshot) {
           var n = snapshot.val();

           console.log(n)
           if (snapshot.val()) {

               res.render(__dirname + "/previousDetails.html", {
                   pbookedBy: n.bookedBy,
                   pbookingDate: n.bookingDate,
                   pbookingStatus: n.bookingStatus,
                   pvehicleName: n.vehicleName,
                   pbookingTime: n.bookingTime,
                   pvehicleNo: n.vehicleNo,
                   pserviceType: n.serviceType
               });

           } else {
               alert("Currently there is no Previous booking of yours ...")
           }
       });

   });


   app.post("/viewDetails", function(req, res) {

       fb.database().ref('pendingDetails/' + name).once('value').then(function(snapshot) {
           var n = snapshot.val();
           if (snapshot.val()) {

               res.render(__dirname + "/viewallDetails.html", {
                   pbookedBy: n.bookedBy,
                   pbookingDate: n.bookingDate,
                   pbookingStatus: n.bookingStatus,
                   pvehicleName: n.vehicleName,
                   pbookingTime: n.bookingTime,
                   pvehicleNo: n.vehicleNo,
                   pserviceType: n.serviceType
               });
           } else {
               alert("Currently there is no Pending Details ...")
           }

       });
   });


   app.post("/editOwner", function(req, res) {

       fb.database().ref('pendingDetails/' + name).once('value').then(function(snapshot) {
           var n = snapshot.val();
           if (snapshot.val()) {

               res.render(__dirname + "/editDetails.html", {
                   pbookedBy: n.bookedBy,
                   pbookingDate: n.bookingDate,
                   pbookingStatus: n.bookingStatus,
                   pvehicleName: n.vehicleName,
                   pbookingTime: n.bookingTime,
                   pvehicleNo: n.vehicleNo,
                   pserviceType: n.serviceType
               });
           } else {
               alert("Currently there is No  Details ...")
           }

       });
   });


   app.post("/completedDetails", function(req, res) {

       fb.database().ref('completedBooking/' + name).once('value').then(function(snapshot) {
           var n = snapshot.val();
           if (snapshot.val()) {

               res.render(__dirname + "/completedBooking.html", {
                   pbookedBy: n.bookedBy,
                   pbookingDate: n.bookingDate,
                   pbookingStatus: n.bookingStatus,
                   pvehicleName: n.vehicleName,
                   pbookingTime: n.bookingTime,
                   pvehicleNo: n.vehicleNo,
                   pserviceType: n.serviceType
               });
           } else {
               alert("Currently there is no  Details ...")
           }

       });
   });



   app.post("/editFirebase", function(req, res) {

       var status = req.body.name;
       console.log(status)

       //NODEMAILER to send data to user

       if (status == "Ready for delivery") {
           var transporter = nodemailer.createTransport({

               service: 'gmail',
               auth: {
                   user: 'johnbiker@gmail.com',
                   pass: 'johnservice007'

               }

           });

           var mailOptions = {
               from: "johnbiker@gmail.com",
               to: 'jstuwart@gmail.com',
               subject: 'bike service is ready for delivery',
               text: 'You can come any time to pickup when the shop is open. Thank You !!!'

           };

           transporter.sendMail(mailOptions, function(error, info) {

               if (error) {
                   console.log(error);
               } else {

                   console.log('Email sent: ' + info.response);

               }

           });

       }

       //usage of Firebase to update status of vehicle

       fb.database().ref("pendingDetails/" + name).update({
           bookingStatus: status
       });


       alert("Your vehicle Status has been updated successfully !!!and a email has been sent to the customer")
   });



   app.post("/deleteFirebase", function(req, res) {

       //usage of firebase database to delete the node 

       fb.database().ref("pendingDetails/" + name).remove();
       alert("This database of the particular user has been deleted")

   });


   //Router to route and sendFile

   app.post("/about", function(req, res) {


       res.sendFile(__dirname + "/about.html");
   });


   app.post("/home", function(req, res) {


       res.sendFile(__dirname + "/home.html");
   });

   app.post("/services", function(req, res) {


       res.sendFile(__dirname + "/services.html");

   });

   app.post("/logout", function(req, res) {

       fb.auth().signOut().then(() => {
           res.sendFile(__dirname + "/signin.html");
       });

   });

   app.post("/forgotAcc", function(req, res) {

       res.sendFile(__dirname + "/forgotPassword.html");


   });

   app.post("/notAcc", function(req, res) {
       res.sendFile(__dirname + "/signup.html");

   });

   app.post("/haveAcc", function(req, res) {
       res.sendFile(__dirname + "/signin.html");

   });
   app.post("/about", function(req, res) {
       res.sendFile(__dirname + "/about.html");

   });
   app.post("/services", function(req, res) {
       res.sendFile(__dirname + "/services.html");

   });



   //Listens at port 5000

   app.listen(5000, async() => {

       console.log("server is running");

   });