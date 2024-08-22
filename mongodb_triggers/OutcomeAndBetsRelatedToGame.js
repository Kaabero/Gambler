exports = async function(changeEvent) {
    const document = changeEvent.fullDocumentBeforeChange
  
    const docId = changeEvent.documentKey._id
  
  
    const serviceName = 'Cluster0'
    const database = 'GamblerApp'
    const betcollection = 'bets'
    const outcomecollection = 'outcomes'
  
    const betsCollection = context.services.get(serviceName).db(database).collection(betcollection)
    const outcomeCollection = context.services.get(serviceName).db(database).collection(outcomecollection)
  
    try {
      if (changeEvent.operationType === 'delete') {
        for (const id of document.bets) {
          await betsCollection.deleteOne({ _id: id })
        }
        console.log('Bets deleted successfully.')

        await outcomeCollection.deleteOne({ _id: document.outcome })
        console.log('Outcome deleted successfully.')

      } else if (changeEvent.operationType === 'update' || changeEvent.operationType === 'replace') {
        for (const id of document.bets) {
          await betsCollection.replaceOne({ '_id': docId }, changeEvent.fullDocument)
        }
        console.log('Bets edited successfully.')
        
        await outcomeCollection.replaceOne({ '_id': docId }, changeEvent.fullDocument)
        console.log('Outcome edited successfully.')
      }
    } catch(err) {
      console.log('error performing mongodb write: ', err.message)
    }
  }