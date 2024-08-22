exports = async function(changeEvent) {
  const deletedDocument = changeEvent.fullDocumentBeforeChange

  if (!deletedDocument || !deletedDocument.game) {
    console.log('No outcomes to delete.')
    return
  }

  const serviceName = 'Cluster0'
  const database = 'GamblerApp'
  const collection = 'games'

  const games = context.services.get(serviceName).db(database).collection(collection)

  const gameId = deletedDocument.game
  const game = games.findOne({ _id: gameId })

  try {
    await game.outcome.deleteOne({ _id: outcome._id })
    console.log('Outcome deleted successfully.')
  } catch(err) {
    console.log('error performing mongodb write: ', err.message)
  }
}