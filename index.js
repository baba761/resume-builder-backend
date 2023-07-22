const { Configuration, OpenAIApi } = require("openai");
const { body, validationResult } = require("express-validator");
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const app = express();
const Sms = require("./models/sms");

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "config.env" });
}

const PORT = process.env.PORT;

var corsOptions = {
    origin: ["https://resume-builder-rohit.netlify.app"],
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.json());

const generateID = () => Math.random().toString(36).substring(2, 10);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
});

const configuration = new Configuration({
    apiKey: process.env.APIKEY,
});

const openai = new OpenAIApi(configuration);

const database = [];

const ChatGPTFunction = async (text) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.6,
        max_tokens: 250,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
    });
    return response.data.choices[0].text;
};

const start = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to mongodb");
    } catch (error) {
        console.log(error);
    }
};

app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
    const {
        fullName,
        currentPosition,
        currentLength,
        currentTechnologies,
        workHistory,
    } = req.body;

    const workArray = JSON.parse(workHistory);
    const newEntry = {
        id: generateID(),
        fullName,
        image_url: `http://localhost:4000/uploads/${req.file.filename}`,
        currentPosition,
        currentLength,
        currentTechnologies,
        workHistory: workArray,
    };

    const prompt1 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I write in the technolegies: ${currentTechnologies}. Can you write a 100 words description for the top of the resume(first person writing)?`;

    const prompt2 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I write in the technolegies: ${currentTechnologies}. Can you write 10 points for a resume on what I am good at?`;

    const remainderText = () => {
        let stringText = "";
        for (let i = 0; i < workArray.length; i++) {
            stringText += ` ${workArray[i].name} as a ${workArray[i].position}.`;
        }
        return stringText;
    };

    const prompt3 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n During my years I worked at ${
        workArray.length
    } companies. ${remainderText()} \n Can you write me 50 words for each company seperated in numbers of my succession in the company (in first person)?`;

    const objective = await ChatGPTFunction(prompt1);
    const keypoints = await ChatGPTFunction(prompt2);
    const jobResponsibilities = await ChatGPTFunction(prompt3);

    const chatgptData = { objective, keypoints, jobResponsibilities };
    const data = { ...newEntry, ...chatgptData };
    database.push(data);

    res.json({
        message: "Request successful!",
        data,
    });
});

app.post(
    "/api/v1/sms",
    [
        body("number").notEmpty().withMessage("number is required"),
        body("name").notEmpty().withMessage("name is required"),
        body("msg").notEmpty().withMessage("msg is required"),
    ],
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).send(validationErrors.array());
        }
        const { name, number, msg, description, type } = req.body;
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() + 5);
        createdAt.setMinutes(createdAt.getMinutes() + 30);
        const sms = await Sms.create({
            name,
            number,
            msg,
            description,
            type,
            createdAt: createdAt,
        });
        res.status(201).send(sms);
    }
);
app.get("/api/v1/sms", async (req, res, next) => {
    const sms = await Sms.find();
    res.status(200).send({
        success: true,
        data: sms,
    });
});

app.get("/api/v1/sms/:id", async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send("Invalid Id");
    }
    const sms = await Sms.findById(req.params.id);
    if (!sms) {
        res.status(400).send("Not found");
    }
    res.status(200).send(sms);
});

app.delete("/api/v1/sms", async (req, res, next) => {
    await Sms.deleteMany();
    res.status(200).send("All sms are deleted");
});

app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
start();
