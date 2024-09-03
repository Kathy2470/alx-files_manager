import dbClient from './utils/db';

const waitConnection = () => new Promise((resolve, reject) => {
  let attempts = 0;
  const maxAttempts = 10;

  const checkConnection = async () => {
    attempts += 1;
    if (attempts >= maxAttempts) {
      reject(new Error('Max attempts reached. Connection failed.'));
      return;
    }

    if (dbClient.isAlive()) {
      resolve();
    } else {
      setTimeout(checkConnection, 1000);
    }
  };

  checkConnection();
});

(async () => {
  try {
    console.log('Initial connection status:', dbClient.isAlive());
    await waitConnection();
    console.log('Connection status after waiting:', dbClient.isAlive());
    console.log('Number of users:', await dbClient.nbUsers());
    console.log('Number of files:', await dbClient.nbFiles());
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
