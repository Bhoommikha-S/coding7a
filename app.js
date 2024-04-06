const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbpath = path.join(__dirname, 'cricketMatchDetails.db')

const app = express()
app.use(express.json())

let db = null

const serverInit = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server running at http://localhost:3000/'),
    )
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

serverInit()

const playerTable = obj => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  }
}

const matchTable = obj => {
  return {
    matchId: obj.match_id,
    match: obj.match,
    year: obj.year,
  }
}

const playerMatchTable = obj => {
  return {
    playerMatchId: obj.player_match_id,
    playerId: obj.player_id,
    matchId: obj.match_id,
    score: obj.score,
    fours: obj.fours,
    sixes: obj.sixes,
  }
}

app.get('/players/', async (request, response) => {
  const query = `SELECT * FROM player_details`
  const result = await db.all(query)
  response.send(result.map(i => playerTable(i)))
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT * FROM player_details WHERE player_id = '${playerId}'`
  const result = await db.get(query)

  response.send(playerTable(result))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body

  const query = `UPDATE player_details SET player_name = '${playerName}' WHERE player_id = '${playerId}'`
  await db.run(query)

  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const query = `SELECT * FROM match_details WHERE match_id = '${matchId}'`
  const result = await db.get(query)

  response.send(matchTable(result))
})

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT match_id,match,year FROM player_match_score NATURAL JOIN match_details WHERE player_id = '${playerId}'`
  const result = await db.all(query)

  response.send(result.map(i => matchTable(i)))
})

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const query = `SELECT player_id,player_name FROM player_match_score NATURAL JOIN player_details WHERE match_id = '${matchId}'`
  const result = await db.all(query)

  response.send(result.map(i => playerTable(i)))
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT player_id,player_name,SUM(score),SUM(fours),SUM(sixes) FROM player_match_score NATURAL JOIN player_details 
   WHERE player_id = '${playerId}'`
  const result = await db.get(query)

  response.send({
    playerId: result[player_id],
    playerName: result[player_name],
    totalScore: result[SUM(score)],
    totalFours: result[SUM(fours)],
    totalSixes: result[SUM(sixes)],
  })
})

module.exports = app
