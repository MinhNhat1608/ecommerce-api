
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prismaClient");

// REGISTER
const register = async (req, res) => {
  try {
    const { username, fullname, password } = req.body;

    if (!username || !fullname || !password) {
      return res.status(400).json({
        message: "Vui long nhap day du thong tin"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username da ton tai"
      });
    }

    const role = await prisma.role.findFirst({
      where: { rolename: "normal" }
    });

    const membership = await prisma.memberShip.findFirst({
      where: { mname: "BASIC" }
    });

    if (!role || !membership) {
      return res.status(500).json({
        message: "Chua co Role hoac MemberShip"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        fullname,
        password: hashedPassword,
        roleid: role.roleid,
        mid: membership.mid
      },
      select: {
        uid: true,
        username: true,
        fullname: true,
        roleid: true,
        mid: true
      }
    });

    res.status(201).json({
      message: "Register successful",
      user: {
        ...user,
        rolename: role.rolename,
        score: membership.score
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Vui long nhap username va password"
      });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        message: "Sai username hoac password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Sai username hoac password"
      });
    }

    const token = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
        roleid: user.roleid
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  register,
  login
};
