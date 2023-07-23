import dotenv from "dotenv";
dotenv.config();
import Database from "./db.js";
let db = new Database();
let couponCode = process.argv[2];
console.log(`Creating ${couponCode}`);
let coupon = new db.Coupon({
    code: couponCode
})(async () => {
    await coupon.save();
    console.log("Created.");
    process.exit(0);
})();
