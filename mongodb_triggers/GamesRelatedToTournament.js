exports = async function(changeEvent) {
    const document = changeEvent.fullDocumentBeforeChange
  
    const docId = changeEvent.documentKey._id
  
  
    const serviceName = 'Cluster0'
    const database = 'GamblerApp'
    const gamecollection = 'games'
    
  
    const games = context.services.get(serviceName).db(database).collection(gamecollection)
    
  
    try {
      if (changeEvent.operationType === 'delete') {
        for (const id of document.games) {
          await games.deleteOne({ _id: id })
        }
        console.log('Games deleted successfully.')


      } else if (changeEvent.operationType === 'update' || changeEvent.operationType === 'replace') {
        for (const id of document.games) {
          await games.replaceOne({ '_id': docId }, changeEvent.fullDocument)
        }
        console.log('Games edited successfully.')
      }
    } catch(err) {
      console.log('error performing mongodb write: ', err.message)
    }
  }