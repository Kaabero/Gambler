exports = async function(changeEvent) {
  const deletedDocument = changeEvent.fullDocumentBeforeChange

  if (!deletedDocument || !deletedDocument.user) {
    console.log('No bets to delete.')
    return
  }

  const serviceName = 'Cluster0'
  const database = 'GamblerApp'
  const collection = 'users'

  const users = context.services.get(serviceName).db(database).collection(collection)

  const userId = deletedDocument.user
  const user = users.findOne({ _id: userId })

  try {
    await user.bets.deleteOne({ _id: bet._id })
    console.log('Bet deleted successfully.')
  } catch(err) {
    console.log('error performing mongodb write: ', err.message)
  }
}