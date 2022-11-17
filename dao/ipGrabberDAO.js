import model from "../models/ipModel.js";

export default class ipGrabberDAO {
  static async putIp(data) {
    if (data.ip) {
      let storedData = await model.findOne({ ip: data.ip });
      if (storedData) {
        storedData.count++;
        await storedData.markModified("count");
        await storedData.save((err) => {
          if (err) console.log(err);
        });
      } else {
        let ip = data.ip;
        let city = data.city || "Unknown";
        let count = 1;
        model.create({
            ip: ip,
            city: city,
            count: count
        });
      }
      return "Your IP address has been logged, for my tracking purposes.";
    }
    console.log('Error - No IP Address found.');
    return null;
  }
}
