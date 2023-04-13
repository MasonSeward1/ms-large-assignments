import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
const port = 8000;
const client = new MongoClient('mongodb://127.0.0.1:27017');
const db = client.db('CP3010Project');

app.use(express.urlencoded({extended: false}));
// app.use(express.static(path.join(__dirname, '../build')));

// Load statistics
app.get('/api/loadStatistics', async (req, res) => {
    await client.connect();
    const statisticData = await db.collection('ClientData').find({}).toArray();

    if (statisticData.length === 0)
    {
        await db.collection('ClientData').insertOne(
            {
                "guessesLeft": 5,
                "timesPlayed": 0,
                "winStreak": 0,
                "dataType": "player"
            })
    }
    else
    {
        res.json(statisticData);
    }
});

app.get('/api/wordGuessed', async (req, res) => {
    res.redirect("/ViewStatistics");
})

// Load word
app.get('/api/loadWord', async (req, res) => {
    await client.connect();
    const selectedWordArray = await db.collection('wordOfDay').aggregate([{$sample:{size:1}}]).toArray();
    var selectedWord;

    selectedWordArray.map(word => selectedWord = word.word);
    res.json(selectedWord);    
});

app.get("/api/setWord", async (req, res) => {
    await client.connect();
    var retrievedWord = await db.collection('words').aggregate([{$sample:{size:1}}]).toArray();
    var selectedWord;

    retrievedWord.map(word => selectedWord = word.word);

    db.collection("wordOfDay").updateOne(
        { dataType: "wordOfDay" },
        { $set: { word: selectedWord }}
    )
})

app.get('/api/updateWinStreak', async (req, res) => {
    db.collection("ClientData").updateOne(
        { dataType: "player" },
        { $inc: { winStreak: 1 }}
    )
})

app.get('/api/deleteWinStreak', async (req, res) => {
    db.collection("ClientData").updateOne(
        { dataType: "player" },
        { $set: { winStreak: 0 }}
    )
})

app.get('/api/loadGuessesLeft', async (req, res) => {
    await client.connect();

    const guessesLeft = await db.collection('ClientData').find({}).toArray();
    res.json(guessesLeft);
})

// Update the timesPlayed record in the db
app.get('/api/updateTimesPlayed', async (req, res) => 
{
    await client.connect();
    
    db.collection("ClientData").updateOne(
        { dataType: "player" },
        { $inc: { timesPlayed: 1 }}
    )
})

app.get('/api/updateGuessesLeft', async (req, res) => {
    await client.connect();
    
    db.collection("ClientData").updateOne(
        { dataType: "player" },
        { $inc: { guessesLeft: -1 }}
    )
})

app.get("/api/resetGuessesLeft", async (req, res) => {
    await client.connect();

    db.collection("ClientData").updateOne(
        { dataType: "player" },
        { $set: { guessesLeft: 5 }}
    )
})

app.listen(8000, () => {
    console.log(`Example app listening on port ${port}`)
});