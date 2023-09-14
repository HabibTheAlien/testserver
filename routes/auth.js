const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

//REGISTER
router.post("/register", async (req, res) => {
	const newUser = new User({
		username: req.body.username,
		email: req.body.email,
		password: CryptoJS.AES.encrypt(
			req.body.password,
			process.env.PASS_SEC
		).toString(),
	});

	try {
		const savedUser = await newUser.save();
		res.status(201).json(savedUser);
	} catch (err) {
		let test = err.keyPattern.email;
		if (test == 1) {
			res.status(501).json("Email is already exist !!!");

			console.log("Email is already exist !!!");
		} else {
			res.status(500).json(err);
			console.log(err);
		}
	}
});

//LOGIN
router.post("/login", async (req, res) => {
	try {
		const email = await User.findOne({
			email: req.body.email,
		});
		!email && res.status(401).json("Wrong Email  !!!");
		const hashedPassword = CryptoJS.AES.decrypt(
			email.password,
			process.env.PASS_SEC
		);
		const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
		const inputPassword = req.body.password;
		originalPassword != inputPassword &&
			res.status(401).json("Wrong Password !!!");
		const accessToken = jwt.sign(
			{
				id: email._id,
				isAdmin: email.isAdmin,
			},
			process.env.JWT_SEC,
			{ expiresIn: "3d" }
		);

		const { password, ...others } = email._doc;
		res.status(200).json({ ...others, accessToken });
	} catch (err) {
		res.status(500).json(err);
		console.log(err);
	}
});

router.post("/forgot-password", (req, res) => {
	const { email } = req.body;
	console.log(email);

	var transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "habibthealien@gmail.com",
			pass: "tebralilqayydmky",
		},
	});

	var mailOptions = {
		from: "habibthealien@gmail.com",
		to: email,
		subject: "Reset Password Link",
		text: `<h1>hello world</h1>`,
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			return res.send({ Status: "Success" });
		}
	});
});

module.exports = router;
