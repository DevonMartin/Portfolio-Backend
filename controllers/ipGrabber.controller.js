import ipGrabberDOA from '../dao/ipGrabberDAO.js';

export const apiIpGrabber = async (req, res) => {
    if (req.body.ip) {
        let response = await ipGrabberDOA.putIp(req.body.ip);
        res.send(response);
    } else {
        console.log("Error: No IP Address retrieved from Client.");
        res.send(
          "I tried grabbing your IP Address, but it didn't exist. Sneaky sneaky..."
        );
    }
};