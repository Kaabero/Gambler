exports = async function(changeEvent) {
    const deletedDocument = changeEvent.fullDocumentBeforeChange
  
     
    const serviceName = 'Cluster0'
    const database = 'GamblerApp'
    const betscollection = 'bets'
    const scorescollection = 'scores'
  
    const betsCollection = context.services.get(serviceName).db(database).collection(betscollection)
    const scoresCollection = context.services.get(serviceName).db(database).collection(scorescollection)
  
    try {
      for (const id of deletedDocument.bets) {
        await betsCollection.deleteOne({ _id: id })
      }
      console.log('Bets deleted successfully.')

      for (const id of deletedDocument.scores) {
        await scoresCollection.deleteOne({ _id: id })
      }
      console.log('Scores deleted successfully.')

    } catch(err) {
      console.log('error performing mongodb write: ', err.message)
    }
  }