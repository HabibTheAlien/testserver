const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const {
	verifyToken,
	verifyTokenAndAuthorization,
	verifyTokenAndAdmin,
} = require("../varifyToken");

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true }
		);
		const accessToken = jwt.sign(
			{
				id: updatedUser._id,
				isAdmin: updatedUser.isAdmin,
			},
			process.env.JWT_SEC,
			{ expiresIn: "3d" }
		);

		const { password, ...others } = updatedUser._doc;
		res.status(200).json({ ...others, accessToken });
	} catch (err) {
		res.status(500).json(err);
	}
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
	try {
		await User.findByIdAndDelete(req.params.id);
		res.status(200).json("User has been deleted...");
	} catch (err) {
		res.status(500).json(err);
	}
});

//GET USER
router.get("/find/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		const { password, ...others } = user._doc;
		res.status(200).json(others);
	} catch (err) {
		res.status(500).json(err);
	}
});
//GET ALL USER
router.get("/", async (req, res) => {
	const query = req.query.new;
	try {
		const users = query
			? await User.find().sort({ _id: -1 }).limit(5)
			: await User.find();
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
