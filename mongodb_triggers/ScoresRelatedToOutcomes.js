exports = async function(changeEvent) {
  const deletedDocument = changeEvent.fullDocumentBeforeChange

 
  const serviceName = 'Cluster0'
  const database = 'GamblerApp'
  const scorescollection = 'scores'

 
  const scores = context.services.get(serviceName).db(database).collection(scorescollection)

  

  try {
   
    for (const id of deletedDocument.scores) {
      const score = await scores.findOne({ _id: id })
      await scores.deleteOne({ _id: id })
    }
    console.log('Scores deleted successfully.')

  } catch(err) {
    console.log('error performing mongodb write: ', err.message)
  }
}