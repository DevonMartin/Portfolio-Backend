import model from "../models/ipModel.js";
import geoip from "geoip-lite";

export default class ipGrabberDAO {
  static async putIp(ip) {
    let data = geoip.lookup(ip);
    let storedData = await model.findOne({ ip: ip });
    if (storedData) {
      storedData.count++;
      await storedData.markModified("count");
      await storedData.save((err) => {
        if (err) console.log(err);
      });
    } else {
      let city = data.city || "Unknown";
      let region = data.region || "Unknown";
      let count = 1;
      model.create({
        ip: ip,
        city: city,
        region: region,
        count: count,
      });
    }
    return "Thanks for checking out my website. :) I have grabbed your IP Address and some info about your location, just so I can see if my website is getting any traffic! If you're a hiring manager from NY.. Please? 🥺🙏🏼";
  }
}
