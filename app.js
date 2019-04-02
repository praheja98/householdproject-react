var express = require('express'),
    handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/newdock');

var app = express();
var cors = require('cors');
var moment = require('moment');
var user = require('./models/user');
var credentials = require('./credentials.js');
var question = require('./models/question.js');
var Payment = require('./models/payment');
var Member = require('./models/Member.js');
var Verification = require('./models/verification.js');
var VerifyPassword = require('./models/verificationPassword.js');
var Transaction = require('./models/Transaction.js');
var Household = require('./models/household.js');
var cookieSession = require('cookie-session');
var nodemailer = require('nodemailer');
var uuidV4 = require('uuid/v4');
var counter = 0;


var md5 = require('md5');

var h = 0;
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        debug: function () {
            console.log("Current Context");
            console.log("=================");
            console.log(this);
            return null
        },
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3017);
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('body-parser').json());
app.set('trust proxy', 1)
app.use(
    cookieSession({
        secret: 'keyboard cat',
        name: 'session',
        keys: ['key1', 'key2'],
        cookie: {secure: true}

    }))
    
app.use(cors({credentials:true, origin:'http://localhost:3000'}))

app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(express.static(__dirname + '/public'));

const dotenv = require('dotenv');
dotenv.config();



var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'parultestcheck1@gmail.com',
        pass: process.env.PASSWORD
    }
});

var mailOptions = {
    from: 'parultestcheck1@gmail.com',
    to: 'parulraheja98@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};


app.get('/testchecking', function (req, res) {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
})


function checkLogin(req, res, uname, password) {

    Member.findOne({username: uname}, function (err, userdata) {

        if (!userdata) {
            res.status(404).send({error: " User not found"});
        }

        else if (userdata.password == md5(password)) {
            req.session.username = userdata.username;
            res.sendStatus(200).json({authorized:true});

        }
        else {
            res.sendStatus(401).json({authorized:false});

        }

    })

}

var length;
question.find({}, function (err, que) {
    length = que.length;
})

app.get('/debuggingtest', function (req, res) {
    res.render('quiz1');
})

app.get('/createtransaction', function (req, res) {
    var transaction1 = new transaction({
        type: 'Deposit',
        amount: 30,
        date: Date.now(),
        memberId: 1,
        paymentId: 1
    }).save();
    res.send('completed ')
})

app.get('/paymentinfo', function (req, res) {
    Payment.find({}, function (err, pay) {
        res.render('paymentinfo', {payment: pay});
    })
})

app.get('/memberinfo/:paymentId', function (req, res) {
    var paymentId = req.params.paymentId;
    var paymentInfo = [];
    var amountDue = {};
    console.log(paymentId);
    Member.find({}, function (err, mem) {
        mem.forEach(function (d) {
            d.payment.forEach(function (paymentDetails) {
                if (paymentDetails.paymentId === paymentId) {
                    paymentDetails['username'] = d.username;
                    paymentInfo.push(paymentDetails);

                }
            })


        })
        Payment.find({paymentId: paymentId}, function (err, paymentDetails) {
            amountDue['amount'] = paymentDetails[0].amountDue;
            console.log('debuggger test 1');
        }).then(function (r) {
            console.log('test debugger payment');
            console.log(r);
            console.log('test debugger payment 2');
            res.render('displaypayments', {
                paymentInfo: paymentInfo,
                amountDue: amountDue
            })
        })
    })
})

app.get('/forgotpassword', function (req, res) {
    res.render('forgotpassword');
})


app.get('/setemail', function (req, res) {
    Member.update({username: 'parul'}, {$set: {email: 'parulraheja98@gmail.com'}}, {new: true}, function (err, doc) {
        res.send(doc);
    })

})


app.post('/generatepassword', function (req, res) {
    var tokenGenerator = uuidV4();
    var email = req.body.email;
    var verificationLink = 'localhost:3017/verifypassword/' + tokenGenerator;

    Member.find({email: email}, function (err, mem) {
        if (mem.length) {
            var verificationCheck = new VerifyPassword({
                token: tokenGenerator,
                username: mem[0].username
            }).save();

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'parultestcheck1@gmail.com',
                    pass: process.env.PASSWORD
                }
            });

            var mailOptions = {
                from: 'parultestcheck1@gmail.com',
                to: email,
                subject: 'Sending Email using Node.js',
                text: verificationLink
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    res.send('enail sent');
                }
            });
        }

        else {
            res.send('user email not found ');
        }
    })


})

app.get('/verifypassword/:verifytoken', function (req, res) {

    var username = req.params.username;
    var token = req.params.verifytoken;
    VerifyPassword.find({token: token}, function (err, verified) {
        if (verified.length && verified[0].counter !== 2) {
            res.render('resetpassword', {username: verified[0].username});
            VerifyPassword.update({token: token}, {$set: {counter: 2}}, {new: true}, function (err, doc) {
                console.log('completed');
            })
        }
        else if (verified[0].counter === 2) {
            res.send('verification link expired');
        }
        else {
            res.send('verification token invalid');
        }


    })


})


app.post('/resetpass', function (req, res) {

    var username = req.body.username;
    if (req.body.pword === req.body.pword2) {
        Member.update({username: username}, {$set: {password: md5(req.body.pword)}}, {new: true}, function (err, upd) {
            res.send(upd);
        })

    }

    else {
        res.send('Password donot match , Please try again ');
    }


})


app.get('/createmembers', function (req, res) {
    member1 = new Member({
        uid: 1,
        password: 'test',
        username: 'test',
        type: 'guest'
    }).save();
    member2 = new Member({
        uid: 2,
        password: 'test',
        username: 'test1',
        type: 'guest'
    }).save();
    res.send('completed');
})


/*

Will depend on the layout of the design IF we want the post request or get request

 */

app.get('/invite/:household', function (req, res) {
    var household = req.params.household;
    res.render('invitation', {household: household});
})


app.post('/addmember', function (req, res) {

    var tokenGenerator = uuidV4();
    var emailAddress = req.body.email;
    var household = req.body.household;
    var verificationLink = 'localhost:3017/verificationtoken/' + tokenGenerator + '/' + household;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'parultestcheck1@gmail.com',
            pass: process.env.PASSWORD
        }
    });

    var mailOptions = {
        from: 'parultestcheck1@gmail.com',
        to: emailAddress,
        subject: 'Sending Email using Node.js',
        text: verificationLink
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    var testVerification = new Verification({
        token: tokenGenerator
    }).save();

    res.send('completed');

})

app.get('/verificationtoken/:token/:household', function (req, res) {
    var token = req.params.token;
    var household = req.params.household;
    Verification.find({token: token}, function (err, tokenExists) {
        if (tokenExists) {
            res.render('register', {household: household});
        }
        else {
            res.send('token is invalid ');
        }

    })


})


app.post('/paymentpage', function (req, res) {
    var householdName = req.body.household;
    Member.find({$and: [{"username": {$ne: req.session.username}}, {"household": {$elemMatch: {name: householdName}}}]}, function (err, mem) {
        res.render('payment', {member: mem, householdName: householdName});
    });
})



app.get('/testcheck', function (req, res) {
    Member.find({}, function (err, mem) {
        res.send(mem);
    })
});

app.get('/testuuid', function (req, res) {
    console.log(uuidV4());
    console.log(uuidV4());
    a = 'checking';
    var link = 'localhost:3017/test/' + a;
    console.log(link);
    res.send(link);
})


app.get('/maketransaction', function (req, res) {
    Payment.find({}, function (err, paymentItems) {
        res.render('transaction', {items: paymentItems});
    })

})


app.post('/transactionpayment', function (req, res) {

    /*
    Payment.findOneAndUpdate({paymentType:req.body.paymentType},{$set:{amountDue:req.body.amount}},{new:true},function(err,doc) {
        res.send(doc);
    })
    */
    var paymentAmount = parseInt(req.body.amount);
    console.log('praheja-test');
    console.log(typeof(paymentAmount));
    var payeeId = req.body.username;
    var paymentType = req.body.paymentType;
    var paymentId = '';
    var personAmountDue = '';
    var personNetAmount = '';
    var paymentItem = '';
    var amountMember = 0;
    console.log('household');
    console.log(req.body.houshold);
    console.log('household 1');

    Payment.find({$and: [{paymentType: paymentType}, {household: req.body.household}]}, function (err, paymentItemInd) {
        paymentItem = paymentItemInd[0];
        paymentId = paymentItem.paymentId;
    })

    Member.find({username: payeeId}, function (err, mem) {
        var member = mem[0];
        amountMember = mem[0].amount;
        member.payment.forEach(function (d) {
            if (d.paymentId == paymentId) {
                personAmountDue = d.amountDue;
                console.log('due check 1');
                console.log(personAmountDue);
                console.log(typeof(personAmountDue));
                console.log(typeof(paymentAmount));
                console.log(paymentAmount);
                console.log('due check 2');
            }
        })
        personNetAmount = personAmountDue + paymentAmount;

    }).then(function (r, err) {
        if (personNetAmount > 0) {
            throw new Error('You cannot pay more than amount due ');
        }

        Member.update({
            username: payeeId,
            "payment.paymentId": paymentId
        }, {$set: {"payment.$.amountDue": personNetAmount}}, {new: true}, function (err, doc) {
            console.log(doc);
        })

        Member.update({username: payeeId}, {$set: {amount: amountMember + paymentAmount}}, {new: true}, function (err, doc) {
            console.log(doc);
        })

        var lender = '';
        var paymentLender = 0;
        console.log('checking id 1');
        console.log(paymentId);
        console.log('checking id 2');
        Payment.find({paymentId: paymentId}, function (err, re) {

            lender = re[0].lender;
            console.log('em debugging test 1');
            console.log(lender);
            console.log(amountMember - paymentAmount);
            console.log('em debugging test 2');
            console.log('r test ');
            console.log(r);
            console.log('r test 1');
            console.log(lender);
            Member.find({username: lender}, function (err, memLender) {
                console.log(memLender);
                paymentLender = memLender[0].amount;
                console.log('rev' + memLender[0].amount);
                console.log('lender payment');
                console.log(paymentLender);
                console.log('lender payment 1');
                Member.update({username: lender}, {$set: {amount: paymentLender - paymentAmount}}, {new: true}, function (err, doc) {
                    console.log(doc);
                })

            }).then(function (r) {

                updAmountDue = paymentItem.amountDue - paymentAmount;
                console.log('upd amount check 1');
                console.log(paymentAmount);
                console.log(paymentId);
                console.log(updAmountDue);
                console.log('upd amount check 2');
                console.log('payment type');
                console.log(paymentType);
                console.log('payment type 1');
                console.log(updAmountDue);
                console.log('why you reach this stage');
                Payment.update({$and: [{paymentType: paymentType}, {household: req.body.household}]}, {$set: {amountDue: updAmountDue}}, {new: true}, function (err, updPayment) {
                   res.json({
                       payment:updPayment
                   })

                })

            })

        })

    }).catch(function (e) {
        res.json({
            error:'You cannot pay more than amount that is due '
        })
    })


})


app.get('/householdtest', function (req, res) {
    Household.find({}).populate('payment').exec(function (err, compl) {
        res.send(compl);
    })
})

app.get('/createhousehold', function (req, res) {
    res.render('household');
})

app.get('/paymentbyhousehold/:name', function (req, res) {
    var householdName = req.params.name;
    Payment.find({household: householdName}, function (err, paymentInfo) {
        console.log('debugger test 1');
        console.log(paymentInfo[0]);
        console.log('debugger test 2');
        //res.render('paymenthousehold', {payment: paymentInfo, household: householdName});
        res.json({
            payment:paymentInfo,
            household:householdName
        })

    })
})


app.get('/testpayment', function (req, res) {
    Member.find({username: req.session.username}, function (err, mem) {
        res.render('testpayment', {household: mem[0].household});
    })
})

app.post('/createhousehold', function (req, res) {
    console.log(req.body.household);
    console.log(req.session.username);
    householdCreate = new Household({
        name: req.body.household
    }).save();

    Member.update({username: req.session.username}, {$push: {household: {name: req.body.household}}}, {new: true}, function (err, doc) {
        res.json({
            householdCreated:true
        })
    });
})


app.get('/listofhouseholds', function (req, res) {
    Member.find({username: req.session.username}, function (err, mem) {
        var listMember = mem[0];
        //res.render('listhousehold', {household: listMember.household});
        res.json({
            household: listMember.household
        })
    })

})

app.post('/householdlist', function (req, res) {
    res.send(req.body.household);
})


app.post('/makepayment', function (req, res) {

    var amount = req.body.amount;
    var type = req.body.type;
    var paymentId = req.body.paymentId;
    var household = req.body.household;
    var date = req.body.date;
    var personList = req.body.person;

    console.log('person check ');
    console.log(req.body.person);
    console.log('person check 1');
    console.log('important test');
    console.log(date);
    console.log('important test 1');
    var personSel = [];
    personSel.push({username: req.session.username});
    if (typeof personList === "string") {
        personSel.push({username: personList});

    }
    else {
        personList.forEach(function (d) {
            var personCreate = {username: d};
            personSel.push(personCreate);
        })

    }

    console.log('testing debugger 1');
    console.log(personSel);
    console.log('testing debugger 2');


    Member.find({$or: personSel}, function (err, mem) {
        console.log('member test 1')
        console.log(mem);
        console.log('member test 2')
        var getMembersLength = personSel.length
        console.log('debugger check 1');
        console.log(mem.length);
        console.log('debugger check 2');
        //var getMembersLength = mem.length;
        var paymentShare = amount / getMembersLength;
        var updAmount = amount - paymentShare;
        var payment = new Payment({
            paymentId: paymentId,
            paymentType: type,
            amountDue: updAmount,
            paymentDate: date,
            lender: req.session.username,
            household: household
        }).save();

        mem.forEach(function (memberLis, i) {
            console.log('test 1');
            console.log(paymentShare);
            console.log('test 2');
            if (memberLis.amount != undefined)
                var amountMemUpd = memberLis.amount;
            else
                amountMemUpd = 0;
            if (memberLis.username == req.session.username)
                Member.update({username: req.session.username}, {$set: {amount: amountMemUpd + updAmount}}, {new: true}, function (err, doc) {
                    console.log('parul raheja test 1');
                })
            else
                Member.update({username: memberLis.username}, {$set: {amount: amountMemUpd - paymentShare}}, {new: true}, function (err, doc) {
        
                    console.log(memberLis.username);
                })

            if (memberLis.username === req.session.username) {
                memberLis.payment.push({
                    paymentId: paymentId,
                    amountDue: +paymentShare
                })
            }
            else {
                memberLis.payment.push({
                    paymentId: paymentId,
                    amountDue: -paymentShare
                })

            }
            memberLis.save();
            console.log('checking member list 1');
            console.log(memberLis);
            console.log('checking member list 2');

            if (i == mem.length - 1)
                completeCount();
        })


    })

    function completeCount() {
        res.json({
            completed:true
        })
    }


})

app.get('/checkdate', function (req, res) {

    var date = new Date();
    console.log("check this date" + date.getDate());
    Payment.find({paymentId: 'bf1nt'}, function (err, pay) {
        var calcDate = pay[0].paymentDate;
        console.log(calcDate.getUTCDate());
        console.log(typeof(calcDate));
        if (calcDate.getUTCDate() == date.getDate())
            res.send('completed')
        else
            res.send('not completed');
    })

})

app.get('/test', function (req, res) {


})

app.get('/billpayment', function (req, res) {
    Payment.find({}, function (err, paymentItems) {
        res.render('transaction', {items: paymentItems, username: req.session.username})
    })
})

app.get('/billpayment/:household', function (req, res) {
    var household = req.params.household;
    Payment.find({household: household}, function (err, paymentItems) {
        //res.render('transaction', {items: paymentItems, username: req.session.username, household: household})
        res.json({
            items:paymentItems,
            username:req.session.username,
            household:household
        })
    })
})


app.get('/transaction', function (req, res) {


})

app.get('/testing', function (req, res) {
    res.render('testing');
})

app.post('/testcheckinghere', function (req, res) {
    res.send(req.body);
})


app.get('/createpayment', function (req, res) {

    var payment1 = new Payment({
        paymentId: 1,
        paymentType: "Household Rent ",
        amountDue: 200,

    }).save();


    var payment2 = new Payment({
        paymentId: 2,
        paymentType: "Groceries",
        amountDue: 200,

    }).save();

    res.send('completed');


})


app.get("/clear/ses", function (req, res) {
    req.session = null;
    res.send("completed");
})


app.post('/processLogin1', function (req, res) {
    checkLogin(req, res, req.body.uname.trim(), req.body.pword.trim())

})

app.get('/Login', function (req, res) {
    if (req.session.username)
       res.sendStatus(200);
    else
        res.sendStatus(401);
})

app.get('/Register', function (req, res) {
    if (req.session.username)
        res.send("Already Login");
    else
        res.render('register');
})

app.post('/processReg1', function (req, res) {
    console.log('checking body');
    console.log(req.body);
    console.log('checking body 1');

    if (req.body.pword.trim() == req.body.pword2.trim()) {

        if (req.body.household) {


            var newUser = Member({
                username: req.body.uname,
                password: md5(req.body.pword),
                email: req.body.email,
                type: "guest",
                amount: 0,
                household: {name: req.body.household}

            })


        }

        else {

            var newUser = Member({
                username: req.body.uname,
                password: md5(req.body.pword),
                email: req.body.email,
                amount: 0,
                type: "guest"

            })

        }

        newUser.save();
        res.status(200).send({authorized:true})

    }

    else {
        res.sendStatus(401).send({authorized:false});
    }


});

app.get('/Logout', function (req, res) {
    req.session.username = null;
    res.redirect(303, '/Login');
})


app.get('/Login', function (req, res) {
    if (req.session.username)
        res.sendStatus(200);
    else {
        res.sendStatus(401);
    }
})

app.get("/getquestions", function (req, res) {
    question.find({}, function (err, ques) {
        res.render('questioncheck', {question: ques});
    })
})



app.get('/sessioninfo', function (req, res) {
    res.send(req.session);
})


app.use(function (req, res) {
    res.status(404);
    res.render('404');
})

app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500);
    res.render('500');
})

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate');
});
