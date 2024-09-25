const express = require("express");
const router = express.Router();
const { tbl_userlog } = require("../models"); // veritabanındaki tablo ismi
const bcrypt = require("bcrypt");

const { sign } = require('jsonwebtoken') // token oluşturmak için

// router.get("/", async (req, res) => {
//     const listOfPosts = await tbl_userlog.findAll(); // veritabanındaki tablo ismiNE GET işlemi ile verileri çekme
//     res.json(listOfPosts);
// });


router.post("/", async (req, res) => {
    const { name, surname, mail, password } = req.body;
    bcrypt.hash(password, 10).then((hash) => {
        tbl_userlog.create({
            name: name,
            surname: surname,
            mail: mail,
            password: hash,
        });
        res.json("SUCCESS");
    });
});

router.post("/login", async (req, res) => {
    const { mail, password } = req.body;
    const user = await tbl_userlog.findOne({ where: { mail: mail } });
    if (!user) res.json({ error: "User Doesn't Exist" });

    bcrypt.compare(password, user.password).then((match) => {
        if (!match) res.json({ error: "Wrong Username And Password Combination" });

        const accessToken = sign(
            { mail: user.mail, id: user.id },
            "importantsecret"
        );
        res.send({ token: accessToken });
    });
});


//çalışıyor
// router.post("/", async (req, res) => {
//     const post = req.body;
//     await tbl_userlog.create(post);  // veritabanındaki tablo ismiNE POST işlemi
//     res.json(post);
// });

module.exports = router;