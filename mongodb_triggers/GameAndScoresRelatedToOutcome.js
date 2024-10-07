/*
Settings in Mongo when creating a new Trigger:

Trigger Details:
Trigger Type: Database
Watch Against: Collection
Cluster Name: Select the right cluster
Database Name: Select the right Database

Collection Name: outcomes
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
  const scoresCollection = 'scores'
  const gamesCollection = 'games'

  const scores = context.services.get(serviceName).db(database).collection(scoresCollection)
  const games = context.services.get(serviceName).db(database).collection(gamesCollection)

  try {
    if (deletedDocument.scores && deletedDocument.scores.length > 0) {
      const deleteResult = await scores.deleteMany({ _id: { $in: deletedDocument.scores } })
      console.log(`Scores deleted successfully.`)
    } else {
      console.log('No scores to delete.')
    }

    if (deletedDocument.game) {
      const updateResult = await games.updateOne(
        { _id: deletedDocument.game },
        { $unset: { outcome: "" } }
      );

      if (updateResult.modifiedCount > 0) {
        console.log('Outcome field removed from the game successfully.')
      } else {
        console.log('No game found to update.');
      }
    } else {
      console.log('No game associated with this outcome.')
    }
  } catch (err) {
    console.log('Error performing MongoDB write: ', err.message)
  }
}