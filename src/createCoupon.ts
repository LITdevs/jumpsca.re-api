import dotenv from "dotenv"
dotenv.config()
import Database from "./db.js";

let database = new Database();

let couponCode = process.argv[2];

console.log(`Creating ${couponCode}`)
database.events.once("ready", async () => {
	let coupon = new database.Coupon({
		code: couponCode
	})
	await coupon.save();

	console.log("Created.")

	process.exit(0)
})