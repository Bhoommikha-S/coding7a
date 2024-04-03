const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbpath = path.join(__dirname, 'cricketMatchDetails.db')

const app = express()
app.use(express.json())

const db = null

const serverInit = async () => {
  try {
    db = await open({
      file: dbpath,
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
  const query = `SELECT * FROM player`
  const result = db.all(query)
  response.send(result.map(i => playerTable(i)))
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT * FROM player WHERE player_id = '${playerId}`
  const result = await db.get(query)

  response.send(playerTable(result))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body

  const query = `UPDATE player SET player_name = ${playerName} WHERE player_id = ${playerId}`
  await db.run(query)

  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const query = `SELECT * FROM match WHERE match_id = ${matchId}`
  const result = await db.get(query)

  response.send(matchTable(result))
})

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT * FROM `
})

module.exports = app
