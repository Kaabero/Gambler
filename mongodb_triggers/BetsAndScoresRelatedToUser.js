/*
Settings in Mongo when creating a new Trigger:

Trigger Details:
Trigger Type: Database
Watch Against: Collection
Cluster Name: Select the right cluster
Database Name: Select the right Database

Collection Name: users
Operation Type: Delete Document

Full Document: On
Document Pre-Image: On

Trigger Configurations:
Auto-Resume: Off
Event Ordering: On
Skip Events on Re-Enable: Off

Event Type:

Select An Event Type: Function

Function: Copy the code below
*/

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