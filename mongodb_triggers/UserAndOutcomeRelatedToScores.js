/*
Settings in Mongo when creating a new Trigger:

Trigger Details:
Trigger Type: Database
Watch Against: Collection
Cluster Name: Select the right cluster
Database Name: Select the right Database

Collection Name: scores
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
  const userscollection = 'users'
  const outcomecollection = 'outcomes'

  const users = context.services.get(serviceName).db(database).collection(userscollection)
  const outcomes = context.services.get(serviceName).db(database).collection(outcomecollection)

  const userId = deletedDocument.user
  const user = users.findOne({ _id: userId })

  const outcomeId = deletedDocument.outcome
  const outcome = outcomes.findOne({ _id: outcomeId })
  
  const scoresId = deletedDocument._id;
  

  try {
    const userresult = await users.updateOne(
      { _id: userId },
      { $pull: { scores: scoresId } }
    );

    if (userresult.modifiedCount > 0) {
      console.log('Scores removed from user\'s scores successfully.')
    } else {
      console.log('Scores was not found in the user\'s scores array.')
    }

    const outcomeresult = await outcomes.updateOne(
      { _id: outcomeId },
      { $pull: { scores: scoresId } }
    );

    if (outcomeresult.modifiedCount > 0) {
      console.log('Scores removed from outcomes\'s scores successfully.');
    } else {
      console.log('Scores was not found in the outcomes\'s scores array.');
    }
  } catch (err) {
    console.log('Error performing MongoDB write: ', err.message);
  }
};