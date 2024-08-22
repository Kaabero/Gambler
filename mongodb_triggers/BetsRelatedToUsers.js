exports = async function(changeEvent) {
  const deletedDocument = changeEvent.fullDocumentBeforeChange

  if (!deletedDocument || !deletedDocument.bets || deletedDocument.bets.length === 0) {
    console.log('No bets to delete.')
    return
  }

  const serviceName = 'Cluster0'
  const database = 'GamblerApp'
  const collection = 'bets'

  const betsCollection = context.services.get(serviceName).db(database).collection(collection)

  try {
    for (const id of deletedDocument.bets) {
      await betsCollection.deleteOne({ _id: id })
    }
    console.log('Bets deleted successfully.')
  } catch(err) {
    console.log('error performing mongodb write: ', err.message)
  }
}