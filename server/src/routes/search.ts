const express = require("express");
const { connectToDatabase } = require("../db/db");
const { validateUser } = require("../middleware/auth");
const router = express.Router();


router.post("/", validateUser, async (req, res) => {
    const {search} = req.body;
    try {
        const db = await connectToDatabase();
        const files = await db.collection('files').find({ name: { $regex: search, $options: 'i' } }).toArray();
        const folders = await db.collection('folders').find({ name: { $regex: search, $options: 'i' } }).toArray();
        res.status(200).json({data:[...files, ...folders]});
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

export default router;
