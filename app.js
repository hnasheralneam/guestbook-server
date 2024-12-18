const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const { Profanity, CensorType } = require('@2toad/profanity');

require("dotenv").config();

const app = express();
const port = process.env.PORT || 54321;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: "*", // ["https://hnasheralneam.dev", "https://profile.hnasheralneam.dev", "*"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const profanity = new Profanity({
    grawlix: "✨uwu✨"
});


mongoose.connect(`mongodb+srv://profile-website-guestbook:${process.env.MONGODB_PASSWORD}@cluster0.e1en0n4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {});

const messageSchema = {
    github: String,
    message: String,
    timestamp: Date
}

const Message = mongoose.model("Message", messageSchema);


app.post("/message", (req, res) => {
    console.log("Request Body:", req.body);

    const github = req.body.github;
    const message = req.body.message;

    if (github.length > 0 && message.length > 0) {
        console.log("message:", message);
        addMessage(github, message);
    }

    res.redirect("https://hnasheralneam.dev#guestbook");
});

app.get("/messages/random-:count", (req, res) => {
    const count = req.params.count;

    Message.find({})
        .then(messages => {
            // pick 5 random no repeating and none if none exist
            const randomMessages = [];
            const randomIndices = [];
            for (let i = 0; i < count; i++) {
                if (randomMessages.length === messages.length) {
                    break;
                }
                let randomIndex = Math.floor(Math.random() * messages.length);
                while (randomIndices.includes(randomIndex)) {
                    randomIndex = Math.floor(Math.random() * messages.length);
                }
                randomIndices.push(randomIndex);
                randomMessages.push(messages[randomIndex]);
            }
            console.log("sending...")
            res.send(randomMessages);
        })
        .catch(err => {
            console.error(err);
            res.send("Error fetching messages");
        });
});

app.get("/messages/all", (req, res) => {
    Message.find({})
        .then(messages => {
            res.send(messages);
        })
        .catch(err => {
            console.error(err);
            res.send("Error fetching messages");
        });
});

function addMessage(userGitHub, message) {
    const newMessage = new Message({
        github: userGitHub,
        message: profanity.censor(message),
        timestamp: Date.now()
    });

    newMessage.save()
        .then(() => console.log("Saved message by " + userGitHub))
        .catch((err) => console.error(err));
}


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});