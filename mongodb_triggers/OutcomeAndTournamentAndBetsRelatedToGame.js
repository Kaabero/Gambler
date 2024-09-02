exports = async function(changeEvent) {
  const document = changeEvent.fullDocumentBeforeChange

  const docId = changeEvent.documentKey._id


  const serviceName = 'Cluster0'
  const database = 'GamblerApp'
  const betcollection = 'bets'
  const outcomecollection = 'outcomes'
  const tournamentcollection = 'tournaments'

  const bets = context.services.get(serviceName).db(database).collection(betcollection)
  const outcomes = context.services.get(serviceName).db(database).collection(outcomecollection)
  const tournaments = context.services.get(serviceName).db(database).collection(tournamentcollection)

  const gameId = document._id;
  const tournamentId = document.tournament;



  try {
    if (changeEvent.operationType === 'delete') {
      for (const id of document.bets) {
        await bets.deleteOne({ _id: id })
      }
      console.log('Bets deleted successfully.')

      

      const tournamentresult = await tournaments.updateOne(
        { _id: tournamentId },
        { $pull: { games: gameId } }
      );


      if (tournamentresult.modifiedCount > 0) {
        console.log('Game removed from tournament\'s games successfully.')
      } else {
        console.log('Game was not found in the tournament\'s games array.')
      }
      
      await outcomes.deleteOne({ _id: document.outcome })
      console.log('Outcome deleted successfully.')


    } else if (changeEvent.operationType === 'update' || changeEvent.operationType === 'replace') {
      for (const id of document.bets) {
        await bets.replaceOne({ '_id': docId }, changeEvent.fullDocument)
      }
      console.log('Bets edited successfully.')
      
      await outcomes.replaceOne({ '_id': docId }, changeEvent.fullDocument)
      console.log('Outcome edited successfully.')
    }
  } catch(err) {
    console.log('error performing mongodb write: ', err.message)
  }
}