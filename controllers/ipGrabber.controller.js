import ipGrabberDOA from '../dao/ipGrabberDAO.js';

export const apiIpGrabber = async (req, res) => {
    let response = await ipGrabberDOA.putIp(req.body);
    res.send(response);
};