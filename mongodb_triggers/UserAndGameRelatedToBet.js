exports = async function(changeEvent) {
  const deletedDocument = changeEvent.fullDocumentBeforeChange;

  const serviceName = 'Cluster0';
  const database = 'GamblerApp';
  const userscollection = 'users';
  const gamescollection = 'games';

  const users = context.services.get(serviceName).db(database).collection(userscollection);
  const games = context.services.get(serviceName).db(database).collection(gamescollection);

  const userId = deletedDocument.user;
  const betId = deletedDocument._id;
  const gameId = deletedDocument.game;

  try {
    const betresult = await users.updateOne(
      { _id: userId },
      { $pull: { bets: betId } }
    );

    const gameresult = await games.updateOne(
      { _id: gameId },
      { $pull: { bets: betId } }
    );

    if (betresult.modifiedCount > 0) {
      console.log('Bet removed from user\'s bets successfully.');
    } else if (gameresult.modifiedCount > 0) {
      console.log('Bet removed from game\'s bets successfully.');
    } else {
      console.log('Bet was not found in the user\'s bets array.');
    }
  } catch (err) {
    console.log('Error performing MongoDB write: ', err.message);
  }
};