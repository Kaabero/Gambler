exports = async function(changeEvent) {
  const deletedDocument = changeEvent.fullDocumentBeforeChange

  if (!deletedDocument || !deletedDocument.user) {
    console.log('No scores to delete.')
    return
  }

  const serviceName = 'Cluster0'
  const database = 'GamblerApp'
  const userscollection = 'users'
  const outcomecollection = 'outcomes'

  const users = context.services.get(serviceName).db(database).collection(userscollection)
  const outcomes = context.services.get(serviceName).db(database).collection(outcomecollection)

  const userId = deletedDocument.user
  const user = users.findOne({ _id: userId })

  const outcomeId = deletedDocument.outcome
  const outcome = outcomes.findOne({ _id: outcomeId })

  try {
    await user.scores.deleteOne({ _id: scores._id })
    
    await outcome.scores.deleteOne({ _id: scores._id })

    console.log('Scores deleted successfully.')
  } catch(err) {
    console.log('error performing mongodb write: ', err.message)
  }
}